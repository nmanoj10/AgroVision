"""
Hybrid crop disease detection pipeline.

Workflow:
1. Load a local TensorFlow/Keras model (.hdf5 or .keras) and predict disease.
2. If confidence is above the configured threshold, return the local model result.
3. If local inference fails or confidence is below threshold, call Gemini for fallback analysis.

Usage:
    python predict.py <image_path>
"""

import base64
import json
import mimetypes
import os
import sys
import tempfile
import traceback
import urllib.error
import urllib.request
import zipfile
import multiprocessing


ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

PREFERRED_GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
]

GEMINI_PROMPT = """
You are an expert agricultural plant pathologist.
Analyze the uploaded plant leaf image and return ONLY valid JSON.

Required JSON schema:
{
  "disease_name": "Precise disease name or Healthy Plant",
  "confidence": 0,
  "severity": "Low",
  "affected_area_percent": 0,
  "is_healthy": false,
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "why_it_happened": "Short explanation of why it occurs.",
  "diagnosis": "Short diagnosis or prediction statement.",
  "causes": ["cause 1", "cause 2", "cause 3"],
  "treatment": ["step 1", "step 2", "step 3", "step 4"],
  "prevention": ["tip 1", "tip 2", "tip 3"],
  "pesticides": [
    {
      "name": "Product name",
      "description": "What it helps with",
      "active_ingredient": "Active ingredient",
      "purchase_link": "https://www.amazon.in/s?k=product+name",
      "price_range": "Rs. 200-400",
      "usage_steps": ["usage 1", "usage 2", "usage 3", "usage 4"]
    }
  ]
}

Rules:
- Return only JSON.
- confidence must be 0-100.
- severity must be one of: Low, Medium, High, Critical.
- symptoms: exactly 3 items unless healthy.
- causes: exactly 3 items unless healthy.
- treatment: exactly 4 items unless healthy.
- prevention: exactly 3 items.
- If healthy, use disease_name as "Healthy Plant", is_healthy=true, pesticides=[].
"""

GEMINI_ENRICH_PROMPT = """
You are an expert agricultural plant pathologist.
The local model has already classified the leaf disease. Your job is to explain it clearly.
Return ONLY valid JSON using the schema below. Do NOT change the disease name or health status.

Provided local classification:
- disease_name: "{disease_name}"
- is_healthy: {is_healthy}
- confidence: {confidence}
- crop: "{crop}"

Required JSON schema:
{
  "disease_name": "{disease_name}",
  "confidence": {confidence},
  "severity": "Low",
  "affected_area_percent": 0,
  "is_healthy": {is_healthy},
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "why_it_happened": "Short explanation of why it occurs.",
  "diagnosis": "Short diagnosis or prediction statement.",
  "causes": ["cause 1", "cause 2", "cause 3"],
  "treatment": ["step 1", "step 2", "step 3", "step 4"],
  "prevention": ["tip 1", "tip 2", "tip 3"],
  "pesticides": [
    {
      "name": "Product name",
      "description": "What it helps with",
      "active_ingredient": "Active ingredient",
      "purchase_link": "https://www.amazon.in/s?k=product+name",
      "price_range": "Rs. 200-400",
      "usage_steps": ["usage 1", "usage 2", "usage 3", "usage 4"]
    }
  ]
}

Rules:
- Return only JSON.
- confidence must be 0-100.
- severity must be one of: Low, Medium, High, Critical.
- symptoms: exactly 3 items unless healthy.
- causes: exactly 3 items unless healthy.
- treatment: exactly 4 items unless healthy.
- prevention: exactly 3 items.
- If healthy, use disease_name as "Healthy Plant", is_healthy=true, pesticides=[].
"""


def is_truthy_env(name, default=""):
    value = os.environ.get(name, default)
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def load_env_file():
    env_path = os.path.join(ROOT_DIR, ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def parse_threshold():
    raw_value = os.environ.get("MODEL_CONFIDENCE_THRESHOLD", "70")
    try:
        threshold = float(raw_value)
    except ValueError:
        threshold = 70.0

    if threshold <= 1:
        threshold *= 100
    return max(0.0, min(100.0, threshold))


def parse_local_timeout_seconds():
    raw_value = os.environ.get("LOCAL_INFERENCE_TIMEOUT_SECONDS", "").strip()
    if not raw_value:
        return None
    try:
        timeout = float(raw_value)
    except ValueError:
        return None
    if timeout <= 0:
        return None
    return timeout


def resolve_model_candidates():
    configured_path = os.environ.get("MODEL_PATH", "").strip()
    candidates = []

    if configured_path:
        if os.path.isabs(configured_path):
            candidates.append(configured_path)
        else:
            candidates.append(os.path.abspath(os.path.join(ROOT_DIR, configured_path)))
            candidates.append(os.path.abspath(os.path.join(ROOT_DIR, "src", "models", os.path.basename(configured_path))))

    candidates.extend(
        [
            os.path.abspath(os.path.join(ROOT_DIR, "src", "models", "plant_disease_recog_model_pwp.keras")),
            os.path.abspath(os.path.join(ROOT_DIR, "src", "models", "Model.hdf5")),
            os.path.abspath(os.path.join(ROOT_DIR, "src", "models", "trained_model.keras")),
        ]
    )

    unique_candidates = []
    for candidate in candidates:
        if candidate not in unique_candidates:
            unique_candidates.append(candidate)
    return unique_candidates


def is_likely_lfs_pointer(file_path):
    try:
        if os.path.getsize(file_path) > 1024:
            return False

        with open(file_path, "r", encoding="utf-8") as model_file:
            first_line = model_file.readline().strip()
        return first_line == "version https://git-lfs.github.com/spec/v1"
    except Exception:
        return False


def normalize_label(raw_label):
    parts = raw_label.split("___")
    crop = parts[0].replace("_", " ").replace(",", "").strip()
    disease_raw = parts[1] if len(parts) > 1 else "Unknown"
    disease_clean = disease_raw.replace("_", " ").strip()
    is_healthy = "healthy" in disease_clean.lower()
    disease_name = f"Healthy {crop}" if is_healthy else f"{crop} {disease_clean}"
    return crop, disease_clean, disease_name, is_healthy


def classify_disease_profile(disease_name):
    lower_name = disease_name.lower()
    if "healthy" in lower_name:
        return "healthy"
    if "virus" in lower_name or "mosaic" in lower_name or "curl" in lower_name:
        return "viral"
    if "rust" in lower_name or "mildew" in lower_name:
        return "fungal_surface"
    if "spot" in lower_name or "scab" in lower_name or "blight" in lower_name or "rot" in lower_name or "mold" in lower_name:
        return "fungal_leaf"
    if "bacterial" in lower_name or "greening" in lower_name:
        return "bacterial"
    if "mite" in lower_name:
        return "pest"
    return "general"


def build_local_pesticides(profile):
    if profile == "healthy":
        return []
    if profile == "viral":
        return [
            {
                "name": "Neem Oil Botanical Spray",
                "description": "Supports pest suppression where virus spread is linked to sap-sucking insects.",
                "active_ingredient": "Azadirachtin / neem extract",
                "purchaseLink": "https://www.amazon.in/s?k=neem+oil+agriculture",
                "priceRange": "Rs. 150-350 per litre",
                "usageSteps": [
                    "Mix 5 ml per litre of water.",
                    "Spray both sides of leaves in the evening.",
                    "Repeat every 5 to 7 days.",
                    "Control whiteflies or aphids around the crop.",
                ],
            }
        ]
    if profile == "pest":
        return [
            {
                "name": "Abamectin 1.9 EC",
                "description": "Used against mites and other sucking pests on leaf crops.",
                "active_ingredient": "Abamectin",
                "purchaseLink": "https://www.amazon.in/s?k=abamectin+1.9+ec",
                "priceRange": "Rs. 300-550 per 100 ml",
                "usageSteps": [
                    "Dilute according to the product label.",
                    "Spray thoroughly on the underside of leaves.",
                    "Repeat after 7 days if needed.",
                    "Avoid spraying during peak sun hours.",
                ],
            }
        ]
    return [
        {
            "name": "Mancozeb 75% WP",
            "description": "Broad-spectrum fungicide commonly used for foliar plant diseases.",
            "active_ingredient": "Mancozeb",
            "purchaseLink": "https://www.amazon.in/s?k=mancozeb+75+wp+fungicide",
            "priceRange": "Rs. 180-400 per 500 g",
            "usageSteps": [
                "Mix 2 to 2.5 g per litre of clean water.",
                "Spray on both leaf surfaces until evenly covered.",
                "Repeat every 7 to 10 days during infection pressure.",
                "Use gloves and follow the product label strictly.",
            ],
        }
    ]


def build_local_structured_result(prediction, threshold):
    disease_name = prediction["disease_name"]
    confidence = prediction["confidence"]
    is_healthy = prediction["is_healthy"]
    profile = classify_disease_profile(disease_name)

    if is_healthy:
        symptoms = [
            "No major lesions or abnormal discoloration detected.",
            "Leaf texture and color look consistent with a healthy plant.",
            "No clear disease pattern crossed the confidence threshold.",
        ]
        causes = [
            "The leaf image does not show strong signs of active disease.",
            "The plant appears to have normal tissue color and structure.",
            "No dominant infection pattern was identified by the local model.",
        ]
        treatment = [
            "Continue regular irrigation and balanced nutrition.",
            "Keep scouting leaves every few days for early symptoms.",
            "Avoid overwatering and maintain field hygiene.",
            "Upload a new close-up image if symptoms appear later.",
        ]
        prevention = [
            "Maintain proper airflow around plants.",
            "Use clean tools and healthy planting material.",
            "Monitor the crop regularly for early warning signs.",
        ]
        why_it_happened = "The local trained model matched this image with healthy leaf patterns above the configured confidence threshold."
        diagnosis = f"Predicted as a healthy plant by the local trained model with {confidence:.2f}% confidence."
        severity = "Low"
        affected_area_percent = 0
    else:
        symptoms = [
            f"Visible leaf damage is consistent with {disease_name}.",
            "Discoloration, spotting, or tissue injury appears on the uploaded leaf.",
            "The infection pattern is strong enough for the local model to classify confidently.",
        ]
        causes = [
            "Disease pressure usually increases when leaves remain wet for long periods.",
            "Pathogens or pests can spread faster under crop stress and dense canopy conditions.",
            "Poor sanitation, infected material, or unmanaged field humidity can worsen the outbreak.",
        ]
        treatment = [
            "Remove badly affected leaves and keep them away from the field.",
            "Apply a crop-appropriate fungicide or pest-control product based on the diagnosis.",
            "Improve airflow, irrigation timing, and drainage to reduce leaf wetness.",
            "Inspect the crop again within 5 to 7 days and repeat management if symptoms continue.",
        ]
        prevention = [
            "Avoid overhead irrigation late in the day.",
            "Maintain field sanitation and remove infected debris.",
            "Use resistant varieties and rotate crops when possible.",
        ]
        why_it_happened = (
            f"The local trained model found visual patterns that match {disease_name}. "
            "This type of disease usually becomes visible when environmental conditions allow pathogens or pests to spread quickly."
        )
        diagnosis = (
            f"Predicted as {disease_name} by the local trained model at {confidence:.2f}% confidence, "
            f"which is above the {threshold:.2f}% confidence threshold."
        )
        severity = "Medium" if confidence < 85 else "High"
        affected_area_percent = 30 if confidence < 85 else 45

    return {
        "disease_name": disease_name,
        "confidence": round(confidence, 2),
        "severity": severity,
        "affected_area_percent": affected_area_percent,
        "is_healthy": is_healthy,
        "symptoms": symptoms,
        "why_it_happened": why_it_happened,
        "diagnosis": diagnosis,
        "causes": causes,
        "treatment": treatment,
        "prevention": prevention,
        "pesticides": build_local_pesticides(profile),
    }


def load_local_model():
    import tensorflow as tf
    import h5py
    from keras.src.saving import serialization_lib

    load_errors = []
    for model_path in resolve_model_candidates():
        if not os.path.exists(model_path):
            continue
        if is_likely_lfs_pointer(model_path):
            load_errors.append(f"{model_path}: file is a Git LFS pointer, not the actual trained model")
            continue
        try:
            model = tf.keras.models.load_model(model_path, compile=False)
            return model, model_path
        except Exception as exc:
            regular_load_error = str(exc)

        # Some Keras 2.x archives can be reconstructed from config + weights
        # even when the bundled loader fails on Windows.
        if model_path.lower().endswith(".keras"):
            try:
                with zipfile.ZipFile(model_path) as archive:
                    config = json.loads(archive.read("config.json"))
                    with tempfile.TemporaryDirectory() as temp_dir:
                        archive.extract("model.weights.h5", temp_dir)
                        weights_path = os.path.join(temp_dir, "model.weights.h5")
                        model = serialization_lib.deserialize_keras_object(config)

                        with h5py.File(weights_path, "r") as weights_file:
                            layers_group = weights_file.get("layers")
                            if layers_group is None:
                                raise RuntimeError("weights archive does not contain a layers group")

                            loaded_weight_layers = 0
                            for layer in model.layers:
                                layer_group = layers_group.get(layer.name)
                                if layer_group is None:
                                    continue

                                vars_group = layer_group.get("vars")
                                if vars_group is None or not vars_group.keys():
                                    continue

                                weights = [vars_group[str(i)][()] for i in sorted(map(int, vars_group.keys()))]
                                layer.set_weights(weights)
                                loaded_weight_layers += 1

                        if loaded_weight_layers == 0:
                            raise RuntimeError("no trainable layer weights were loaded from the .keras archive")

                        return model, model_path
            except Exception as manual_exc:
                load_errors.append(
                    f"{model_path}: regular load failed with '{regular_load_error}'; "
                    f"manual archive load failed with '{manual_exc}'"
                )
                continue

        load_errors.append(f"{model_path}: {regular_load_error}")

    message = "No usable local model file was found."
    if load_errors:
        message = " | ".join(load_errors)
    raise RuntimeError(message)


class LocalInferenceTimeout(RuntimeError):
    pass


def _local_predict_worker(image_path, threshold, queue):
    try:
        result = run_local_model_prediction(image_path, threshold)
        queue.put({"ok": True, "result": result})
    except Exception as exc:
        queue.put({"ok": False, "error": str(exc)})


def run_local_model_prediction_with_timeout(image_path, threshold, timeout_seconds):
    if not timeout_seconds:
        return run_local_model_prediction(image_path, threshold)

    ctx = multiprocessing.get_context("spawn")
    queue = ctx.Queue()
    process = ctx.Process(target=_local_predict_worker, args=(image_path, threshold, queue))
    process.daemon = True
    process.start()
    process.join(timeout_seconds)

    if process.is_alive():
        process.terminate()
        process.join(2)
        raise LocalInferenceTimeout(
            f"Local model inference exceeded {timeout_seconds:.2f} seconds."
        )

    if queue.empty():
        raise RuntimeError("Local model process ended without returning a result.")

    payload = queue.get()
    if payload.get("ok"):
        return payload.get("result")
    raise RuntimeError(payload.get("error") or "Local model prediction failed.")


def run_local_model_prediction(image_path, threshold):
    import numpy as np
    from PIL import Image

    model, model_path = load_local_model()

    img = Image.open(image_path).convert("RGB")
    input_shape = model.input_shape
    height = input_shape[1] if input_shape[1] else 224
    width = input_shape[2] if input_shape[2] else 224
    img = img.resize((width, height))
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array, verbose=0)
    predicted_idx = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0])) * 100.0
    raw_label = CLASS_NAMES[predicted_idx] if predicted_idx < len(CLASS_NAMES) else f"Unknown_Class_{predicted_idx}"
    crop, disease_raw, disease_name, is_healthy = normalize_label(raw_label)

    prediction = {
        "disease_name": disease_name,
        "confidence": round(confidence, 2),
        "is_healthy": is_healthy,
        "raw_label": raw_label,
        "crop": crop,
        "disease_raw": disease_raw,
        "model_path": model_path,
        "threshold": threshold,
    }

    result = {
        "success": True,
        "source": "Local Trained Model",
        "source_reason": "local_model_confident",
        "model_prediction": prediction,
        "modelStatus": {
            "working": True,
            "mode": "local-model-first",
            "threshold": threshold,
            "modelPath": model_path,
        },
        "data": build_local_structured_result(prediction, threshold),
    }

    if confidence >= threshold:
        return result

    result["success"] = False
    result["source"] = "Gemini AI Fallback"
    result["source_reason"] = "local_model_low_confidence"
    result["message"] = (
        f"Local model confidence {confidence:.2f}% is below the configured threshold of {threshold:.2f}%."
    )
    return result


def gemini_request(image_path):
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"
    with open(image_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

    payload = {
        "generationConfig": {"responseMimeType": "application/json"},
        "contents": [
            {
                "parts": [
                    {"text": GEMINI_PROMPT},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": encoded_image,
                        }
                    },
                ]
            }
        ]
    }

    request_data = json.dumps(payload).encode("utf-8")
    last_error = None
    model_names = get_supported_gemini_models(api_key)

    for model_name in model_names:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        request = urllib.request.Request(
            endpoint,
            data=request_data,
            headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                body = json.loads(response.read().decode("utf-8"))
                return model_name, body
        except urllib.error.HTTPError as exc:
            last_error = normalize_gemini_error(exc.read().decode("utf-8", errors="ignore"), exc.code)
            if exc.code in (404, 429, 500, 503):
                continue
            raise RuntimeError(last_error or str(exc)) from exc
        except Exception as exc:
            last_error = str(exc)
            continue

    raise RuntimeError(last_error or "All Gemini models failed.")


def gemini_request_text(prompt):
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    payload = {
        "generationConfig": {"responseMimeType": "application/json"},
        "contents": [{"parts": [{"text": prompt}]}],
    }

    request_data = json.dumps(payload).encode("utf-8")
    last_error = None
    model_names = get_supported_gemini_models(api_key)

    for model_name in model_names:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        request = urllib.request.Request(
            endpoint,
            data=request_data,
            headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                body = json.loads(response.read().decode("utf-8"))
                return model_name, body
        except urllib.error.HTTPError as exc:
            last_error = normalize_gemini_error(exc.read().decode("utf-8", errors="ignore"), exc.code)
            if exc.code in (404, 429, 500, 503):
                continue
            raise RuntimeError(last_error or str(exc)) from exc
        except Exception as exc:
            last_error = str(exc)
            continue

    raise RuntimeError(last_error or "All Gemini models failed.")


def normalize_gemini_error(raw_error, status_code=None):
    try:
        parsed = json.loads(raw_error)
        message = parsed.get("error", {}).get("message") or raw_error
    except Exception:
        message = raw_error

    if status_code == 429 or "quota" in message.lower() or "resource_exhausted" in message.lower():
        return "RATE_LIMIT: Gemini API quota exceeded. Please try again later or use a different API key."

    if status_code == 404 or "not found" in message.lower():
        return f"MODEL_NOT_FOUND: {message}"

    return message.strip()


def get_supported_gemini_models(api_key):
    request = urllib.request.Request(
        "https://generativelanguage.googleapis.com/v1beta/models",
        headers={"x-goog-api-key": api_key},
        method="GET",
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))

    available = []
    for model in payload.get("models", []):
        name = (model.get("name") or "").replace("models/", "")
        methods = model.get("supportedGenerationMethods") or []
        if "generateContent" in methods:
            available.append(name)

    prioritized = []
    for preferred_name in PREFERRED_GEMINI_MODELS:
        if preferred_name in available and preferred_name not in prioritized:
            prioritized.append(preferred_name)

    for available_name in available:
        if available_name.startswith("gemini-") and available_name not in prioritized:
            prioritized.append(available_name)

    if not prioritized:
        raise RuntimeError("No Gemini models with generateContent support were returned by the API.")

    return prioritized


def extract_gemini_text(response_json):
    candidates = response_json.get("candidates") or []
    for candidate in candidates:
        content = candidate.get("content") or {}
        parts = content.get("parts") or []
        for part in parts:
            text = part.get("text")
            if text:
                return text.strip()
    raise RuntimeError("Gemini did not return any text content.")


def normalize_gemini_result(parsed):
    symptoms = parsed.get("symptoms") if isinstance(parsed.get("symptoms"), list) else []
    causes = parsed.get("causes") if isinstance(parsed.get("causes"), list) else []
    treatment = parsed.get("treatment") if isinstance(parsed.get("treatment"), list) else []
    prevention = parsed.get("prevention") if isinstance(parsed.get("prevention"), list) else []

    pesticides = []
    for pesticide in parsed.get("pesticides", []) if isinstance(parsed.get("pesticides"), list) else []:
        pesticides.append(
            {
                "name": pesticide.get("name", "General Crop Protection Product"),
                "description": pesticide.get("description", ""),
                "active_ingredient": pesticide.get("active_ingredient", ""),
                "purchaseLink": pesticide.get("purchase_link", "https://www.amazon.in/s?k=plant+disease+treatment"),
                "priceRange": pesticide.get("price_range", "Rs. 200-500"),
                "usageSteps": pesticide.get("usage_steps", ["Follow the label instructions on the product."]),
            }
        )

    return {
        "disease_name": parsed.get("disease_name", "Unknown Disease"),
        "confidence": max(0.0, min(100.0, float(parsed.get("confidence", 75) or 75))),
        "severity": parsed.get("severity") if parsed.get("severity") in ["Low", "Medium", "High", "Critical"] else "Medium",
        "affected_area_percent": max(0.0, min(100.0, float(parsed.get("affected_area_percent", 25) or 25))),
        "is_healthy": bool(parsed.get("is_healthy", False)),
        "symptoms": symptoms[:3] or ["Visible symptoms require expert review.", "Leaf tissue shows abnormal patterns.", "A closer field inspection is recommended."],
        "why_it_happened": parsed.get("why_it_happened", "The likely cause could not be fully determined from the image alone."),
        "diagnosis": parsed.get("diagnosis", "Gemini provided a fallback diagnosis from the uploaded image."),
        "causes": causes[:3] or ["Environmental stress", "Disease pressure in the field", "Crop management conditions"],
        "treatment": treatment[:4] or ["Remove infected tissue", "Use a suitable crop protection product", "Improve drainage and airflow", "Reinspect after a few days"],
        "prevention": prevention[:3] or ["Monitor the crop regularly", "Keep the field clean", "Use balanced irrigation and spacing"],
        "pesticides": pesticides,
    }


def run_gemini_fallback(image_path, local_result=None):
    model_name, raw_response = gemini_request(image_path)
    text = extract_gemini_text(raw_response)

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise RuntimeError("Gemini returned a non-JSON response.")

    parsed = json.loads(text[start : end + 1])
    return {
        "success": True,
        "source": "Gemini AI Fallback",
        "source_reason": "local_model_unavailable" if not local_result else local_result.get("source_reason", "local_model_low_confidence"),
        "model_prediction": local_result.get("model_prediction") if local_result else None,
        "modelStatus": {
            "working": bool(local_result and local_result.get("modelStatus", {}).get("working")),
            "mode": "local-model-first-with-gemini-fallback",
            "threshold": parse_threshold(),
            "fallbackModel": model_name,
            "localMessage": None if not local_result else local_result.get("message"),
            "localModelPath": None if not local_result else local_result.get("modelStatus", {}).get("modelPath"),
        },
        "data": normalize_gemini_result(parsed),
    }


def run_gemini_enrichment(local_result):
    prediction = local_result.get("model_prediction") or {}
    crop = prediction.get("crop") or "Unknown Crop"
    confidence = prediction.get("confidence", 75)
    is_healthy = bool(prediction.get("is_healthy", False))
    disease_name = (local_result.get("data") or {}).get("disease_name") or prediction.get("disease_name") or "Unknown Disease"

    prompt = GEMINI_ENRICH_PROMPT.format(
        disease_name=disease_name,
        is_healthy=str(is_healthy).lower(),
        confidence=confidence,
        crop=crop,
    )

    model_name, raw_response = gemini_request_text(prompt)
    text = extract_gemini_text(raw_response)

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise RuntimeError("Gemini returned a non-JSON response.")

    parsed = json.loads(text[start : end + 1])
    parsed["disease_name"] = disease_name
    parsed["is_healthy"] = is_healthy
    parsed["confidence"] = confidence

    normalized = normalize_gemini_result(parsed)
    normalized["disease_name"] = disease_name
    normalized["is_healthy"] = is_healthy
    normalized["confidence"] = confidence

    model_status = dict(local_result.get("modelStatus") or {})
    model_status["enrichedByGemini"] = True
    model_status["enrichmentModel"] = model_name

    return {
        "success": True,
        "source": "Local Trained Model",
        "source_reason": "local_model_confident_with_gemini_enrichment",
        "model_prediction": local_result.get("model_prediction"),
        "modelStatus": model_status,
        "data": normalized,
    }


def detect_disease(image_path):
    threshold = parse_threshold()
    timeout_seconds = parse_local_timeout_seconds()
    local_error = None
    local_result = None

    try:
        local_result = run_local_model_prediction_with_timeout(image_path, threshold, timeout_seconds)
        if local_result.get("success"):
            if is_truthy_env("GEMINI_ENRICH_LOCAL", "false") and os.environ.get("GEMINI_API_KEY"):
                try:
                    return run_gemini_enrichment(local_result)
                except Exception as enrich_exc:
                    model_status = dict(local_result.get("modelStatus") or {})
                    model_status["enrichmentError"] = str(enrich_exc)
                    local_result["modelStatus"] = model_status
                    return local_result
            return local_result
    except LocalInferenceTimeout as exc:
        local_error = {
            "success": False,
            "source": "Gemini AI Fallback",
            "source_reason": "local_model_timeout",
            "message": str(exc),
            "modelStatus": {
                "working": False,
                "mode": "local-model-first",
                "threshold": threshold,
                "timeoutSeconds": timeout_seconds,
                "error": str(exc),
                "reason": "Local model inference exceeded the configured timeout.",
                "solution": "Increase LOCAL_INFERENCE_TIMEOUT_SECONDS or rely on Gemini fallback.",
            },
        }
    except ImportError as exc:
        local_error = {
            "success": False,
            "source": "Gemini AI Fallback",
            "source_reason": "local_model_dependency_error",
            "message": f"Local model dependencies are missing: {exc}",
            "modelStatus": {
                "working": False,
                "mode": "local-model-first",
                "threshold": threshold,
                "error": str(exc),
                "reason": "Missing Python dependencies for local inference.",
                "solution": "Install tensorflow, pillow, and numpy in the Python environment.",
            },
        }
    except Exception as exc:
        local_error = {
            "success": False,
            "source": "Gemini AI Fallback",
            "source_reason": "local_model_error",
            "message": str(exc),
            "modelStatus": {
                "working": False,
                "mode": "local-model-first",
                "threshold": threshold,
                "error": str(exc),
                "reason": "Local model prediction failed.",
                "solution": "Check MODEL_PATH, model compatibility, and image preprocessing.",
            },
        }

    if not local_result:
        local_result = local_error

    try:
        return run_gemini_fallback(image_path, local_result)
    except Exception as gemini_exc:
        model_status = dict(local_result.get("modelStatus") or {}) if local_result else {}
        model_status["fallbackError"] = str(gemini_exc)
        model_status["fallbackAvailable"] = False

        local_prediction = None if not local_result else local_result.get("model_prediction")
        local_confidence = None
        if isinstance(local_prediction, dict):
            local_confidence = local_prediction.get("confidence")

        if local_confidence is not None:
            message = (
                f"Gemini fallback failed: {gemini_exc}. "
                f"Local model confidence {local_confidence:.2f}% is below the {threshold:.2f}% threshold."
            )
        else:
            message = f"Gemini fallback failed: {gemini_exc}."

        return {
            "success": False,
            "source": "Gemini AI Fallback",
            "source_reason": "gemini_fallback_failed",
            "message": message,
            "model_prediction": local_prediction,
            "modelStatus": model_status,
            "traceback": traceback.format_exc(),
        }


if __name__ == "__main__":
    load_env_file()

    if len(sys.argv) < 2:
        result = {
            "success": False,
            "message": "No image path provided.",
            "source": "Gemini AI Fallback",
            "source_reason": "invalid_input",
        }
    else:
        result = detect_disease(sys.argv[1])

    print(json.dumps(result))
    sys.exit(0 if result.get("success") else 1)

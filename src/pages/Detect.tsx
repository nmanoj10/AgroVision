import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Search, History, Info, AlertTriangle, ImageOff, Users } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { UploadZone } from '../components/detect/UploadZone';
import { ResultCard } from '../components/detect/ResultCard';
import { useDetectStore } from '../store/detectStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';
import { cropService } from '../services/cropService';
import { CropScan } from '../types';

export default function Detect() {
  const { result, isLoading, loadingStep, error, detect, resetResult, scanHistory, loadHistory } = useDetectStore();
  const [relatedScans, setRelatedScans] = useState<CropScan[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const diseaseName = result?.data?.disease_name;
    if (!diseaseName || result?.data?.is_healthy) {
      setRelatedScans([]);
      return;
    }

    let active = true;
    setRelatedLoading(true);
    cropService
      .getRelatedScans(diseaseName, 6)
      .then((scans) => {
        if (!active) return;
        setRelatedScans(scans);
      })
      .finally(() => {
        if (!active) return;
        setRelatedLoading(false);
      });

    return () => {
      active = false;
    };
  }, [result]);

  const handleFileSelect = (file: File) => {
    detect(file);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
                <Leaf className="h-6 w-6" />
              </div>
              Disease Detection
            </h1>
            <p className="text-text-muted mt-1">
              Upload a clear leaf image. The local trained model runs first, and Gemini is used only when the model is uncertain.
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-300">
            <Info className="h-4 w-4 text-violet-400" />
            Local model first, Gemini AI fallback
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <UploadZone onFileSelect={handleFileSelect} isLoading={isLoading} loadingStep={loadingStep} />

            {error && (
              <Card className="border-accent-red/50 bg-accent-red/5 text-accent-red">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-accent-red/10 p-2">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Detection failed</h4>
                    <p className="text-xs text-accent-red/90 mt-1">{error}</p>
                    <p className="text-[11px] text-accent-red/70 mt-2">
                      Check the backend console or `server/backend.out.log` for more details.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="bg-accent-blue/5 border-accent-blue/20">
              <h4 className="text-sm font-bold text-accent-blue mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Tips for better results
              </h4>
              <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4">
                <li>Ensure the leaf is well-lit and in focus</li>
                <li>Capture the affected area clearly</li>
                <li>Use a plain background if possible</li>
                <li>Avoid blurry or dark images</li>
              </ul>
            </Card>
          </div>

          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {result ? (
                <ResultCard key="result" data={result.data} source={result.source} onReset={resetResult} />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 rounded-3xl border-2 border-dashed border-border-light bg-bg-card/30"
                >
                  <div className="relative mb-8">
                    <Leaf className="h-24 w-24 text-text-dim" />
                    <Search className="absolute -bottom-2 -right-2 h-10 w-10 text-accent-green animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Upload a leaf photo</h3>
                  <p className="text-text-muted max-w-xs">
                    Results will show disease name, symptoms, cause, diagnosis, and treatment from either the local model or Gemini fallback.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="pt-12 space-y-6">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-accent-green" />
            <h2 className="text-2xl font-bold text-text-primary">Your Recent Scans</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {scanHistory.map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover className="p-0 overflow-hidden group">
                  <div className="relative h-40 overflow-hidden">
                    {scan.imageUrl ? (
                      <img
                        src={scan.imageUrl}
                        alt={scan.detectedDisease}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-text-dim">
                        <ImageOff className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant={scan.severity === 'High' || scan.severity === 'Critical' ? 'error' : 'warning'}>
                        {scan.severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-text-primary truncate mb-1">{scan.detectedDisease}</h4>
                    <p className="text-xs text-text-muted">{formatDate(scan.createdAt)}</p>
                    <p className="text-[11px] text-accent-green mt-1">{scan.source}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {result && !result.data.is_healthy && (
          <div className="pt-8 space-y-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-accent-amber" />
              <h2 className="text-2xl font-bold text-text-primary">Related Community Scans</h2>
            </div>

            {relatedLoading ? (
              <div className="text-sm text-text-muted">Finding similar cases...</div>
            ) : relatedScans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedScans.map((scan, i) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card hover className="p-0 overflow-hidden group">
                      <div className="relative h-40 overflow-hidden">
                        {scan.imageUrl ? (
                          <img
                            src={scan.imageUrl}
                            alt={scan.detectedDisease}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5 text-text-dim">
                            <ImageOff className="h-10 w-10" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge variant={scan.severity === 'High' || scan.severity === 'Critical' ? 'error' : 'warning'}>
                            {scan.severity}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-text-primary truncate mb-1">{scan.detectedDisease}</h4>
                        <p className="text-xs text-text-muted">{formatDate(scan.createdAt)}</p>
                        <p className="text-[11px] text-accent-amber mt-1">{scan.source}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-text-muted">No related scans found yet.</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

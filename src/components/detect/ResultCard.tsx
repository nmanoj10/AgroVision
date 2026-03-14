import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  ShoppingCart,
  ExternalLink,
  Sparkles,
  WrenchIcon,
  Lightbulb,
  HelpCircle,
  Leaf,
  ClipboardList,
} from 'lucide-react';
import { DiseaseData, DetectionSource } from '../../types';
import { formatPercent } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ResultCardProps {
  data: DiseaseData;
  source: DetectionSource;
  onReset: () => void;
}

const severityVariant = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
  Critical: 'error',
} as const;

const sourceLabel: Record<DetectionSource, string> = {
  'Local Trained Model': 'Result from local trained model',
  'Gemini AI Fallback': 'Result from Gemini AI fallback',
};

export const ResultCard = ({ data, source, onReset }: ResultCardProps) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 w-fit"
    >
      <Sparkles className="h-4 w-4 text-violet-400" />
      <span className="text-xs font-bold text-violet-300">{sourceLabel[source]}</span>
    </motion.div>

    <Card
      className={`border bg-gradient-to-br ${
        data.is_healthy ? 'from-emerald-900/20 to-bg-primary border-emerald-500/30' : 'from-bg-card to-bg-primary border-accent-green/30'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={severityVariant[data.severity]}>{data.severity} Severity</Badge>
            {data.is_healthy && (
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Healthy
              </Badge>
            )}
            <span className="text-xs text-text-muted bg-white/5 px-2 py-1 rounded-full border border-white/10">
              {formatPercent(data.confidence)} confidence
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">{data.disease_name}</h2>
        </div>
        <div
          className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
            data.is_healthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}
        >
          {data.is_healthy ? <Leaf className="h-10 w-10" /> : <AlertTriangle className="h-10 w-10" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-text-muted">Confidence Score</span>
            <span className="text-accent-green">{formatPercent(data.confidence)}</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.confidence}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${data.confidence > 70 ? 'bg-accent-green' : 'bg-accent-amber'}`}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-text-muted">Affected Leaf Area</span>
            <span className="text-accent-orange">{formatPercent(data.affected_area_percent)}</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.affected_area_percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-accent-orange rounded-full"
            />
          </div>
        </div>
      </div>

      {data.symptoms && data.symptoms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10"
        >
          <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-accent-blue" /> Symptoms
          </p>
          <div className="space-y-2">
            {data.symptoms.map((symptom, index) => (
              <p key={index} className="text-sm text-text-secondary">
                {index + 1}. {symptom}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {data.why_it_happened && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20"
        >
          <p className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" /> Why it occurs
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">{data.why_it_happened}</p>
        </motion.div>
      )}

      {data.diagnosis && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
        >
          <p className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Prediction / Diagnosis
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">{data.diagnosis}</p>
        </motion.div>
      )}

      <div className="space-y-4">
        <details open className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors list-none">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-accent-blue" />
              <span className="font-bold text-text-primary">Root Causes</span>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted group-open:rotate-90 transition-transform" />
          </summary>
          <div className="p-4 pt-2 space-y-2">
            {data.causes.map((cause, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <div className="h-5 w-5 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-xs font-bold text-accent-blue shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p>{cause}</p>
              </div>
            ))}
          </div>
        </details>

        <details open className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors list-none">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-accent-green" />
              <span className="font-bold text-text-primary">Recommended Pesticides / Treatment</span>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted group-open:rotate-90 transition-transform" />
          </summary>
          <div className="p-4 pt-2 space-y-3">
            {data.treatment.map((step, index) => (
              <div key={index} className="flex gap-4 p-3 rounded-xl bg-accent-green/5 border border-accent-green/10">
                <div className="h-6 w-6 rounded-full bg-accent-green text-bg-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </details>

        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors list-none">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent-lime" />
              <span className="font-bold text-text-primary">Prevention Strategy</span>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted group-open:rotate-90 transition-transform" />
          </summary>
          <div className="p-4 pt-2 space-y-2">
            {data.prevention.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <div className="h-1.5 w-1.5 rounded-full bg-accent-lime mt-1.5 shrink-0" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </details>
      </div>
    </Card>

    {data.pesticides && data.pesticides.length > 0 && !data.is_healthy && (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-accent-amber/30 bg-gradient-to-br from-amber-950/30 to-bg-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-accent-amber/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-accent-amber" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-lg">Recommended Pesticides</h3>
              <p className="text-xs text-text-muted">Structured treatment suggestions based on the selected analysis source</p>
            </div>
          </div>

          <div className="space-y-6">
            {data.pesticides.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/5 to-transparent">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-6 w-6 rounded-full bg-accent-amber text-bg-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-text-primary">{p.name}</h4>
                      </div>
                      <p className="text-xs text-text-secondary ml-8">{p.description}</p>
                      {p.active_ingredient && (
                        <p className="text-xs text-text-muted ml-8 mt-1">
                          Active ingredient: <span className="text-accent-amber/70">{p.active_ingredient}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-accent-amber bg-accent-amber/10 px-3 py-1 rounded-full border border-accent-amber/20 shrink-0">
                      {p.priceRange}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs font-bold text-text-muted mb-3 flex items-center gap-2">
                    <WrenchIcon className="h-3.5 w-3.5" /> How to use
                  </p>
                  <div className="space-y-2">
                    {p.usageSteps.map((step, sIdx) => (
                      <div key={sIdx} className="flex gap-3 text-sm">
                        <span className="font-bold text-accent-amber shrink-0 text-xs mt-0.5">{sIdx + 1}.</span>
                        <span className="text-text-secondary">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <a
                    href={p.purchaseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-amber text-bg-primary font-bold text-sm hover:bg-accent-amber/90 transition-all hover:scale-105 active:scale-95"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Buy / Learn More
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-text-dim flex items-start gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-accent-amber shrink-0 mt-0.5" />
              Always follow labeled dosage instructions. Consult a local agronomist before applying any pesticide.
            </p>
          </div>
        </Card>
      </motion.div>
    )}

    <div className="flex flex-wrap gap-4">
      <Button className="flex-1 min-w-[200px]" onClick={() => (window.location.href = '/chat')}>
        <MessageSquare className="mr-2 h-5 w-5" />
        Ask AI About This
      </Button>
      <Button variant="outline" className="flex-1 min-w-[200px]" onClick={onReset}>
        <RefreshCw className="mr-2 h-5 w-5" />
        Scan Another
      </Button>
    </div>
  </motion.div>
);

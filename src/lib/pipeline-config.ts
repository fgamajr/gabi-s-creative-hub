import type { PipelineStageConfig, PipelineStageId } from '@/types/dashboard';

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: 'harvest',
    label: 'Harvest',
    description: 'Download CSV files',
    color: 'hsl(217, 91%, 60%)',
    bgColor: 'hsl(217, 91%, 97%)',
    borderColor: 'hsl(217, 91%, 85%)'
  },
  {
    id: 'sync',
    label: 'Sync',
    description: 'PostgreSQL sync',
    color: 'hsl(262, 83%, 58%)',
    bgColor: 'hsl(262, 83%, 97%)',
    borderColor: 'hsl(262, 83%, 85%)'
  },
  {
    id: 'ingest',
    label: 'Ingest',
    description: 'Process & parse',
    color: 'hsl(142, 76%, 36%)',
    bgColor: 'hsl(142, 76%, 97%)',
    borderColor: 'hsl(142, 76%, 85%)'
  },
  {
    id: 'index',
    label: 'Index',
    description: 'Elasticsearch',
    color: 'hsl(45, 93%, 47%)',
    bgColor: 'hsl(45, 93%, 97%)',
    borderColor: 'hsl(45, 93%, 80%)'
  }
];

export function getStageConfig(id: PipelineStageId): PipelineStageConfig {
  return PIPELINE_STAGES.find(s => s.id === id) || PIPELINE_STAGES[0];
}

export function getStageIndex(id: PipelineStageId): number {
  return PIPELINE_STAGES.findIndex(s => s.id === id);
}

export function getNextStage(id: PipelineStageId): PipelineStageId | null {
  const idx = getStageIndex(id);
  return idx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[idx + 1].id : null;
}

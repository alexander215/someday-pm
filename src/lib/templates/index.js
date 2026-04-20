import { generalTemplate } from './general'
import { buildAnAppTemplate } from './build_an_app'

const TEMPLATES = {
  general: generalTemplate,
  build_an_app: buildAnAppTemplate,
}

export function getTemplateConfig(key) {
  return TEMPLATES[key] ?? TEMPLATES.general
}

export function getAllTemplates() {
  return Object.values(TEMPLATES).map(t => ({
    key: t.key,
    name: t.name,
    description: t.description,
  }))
}

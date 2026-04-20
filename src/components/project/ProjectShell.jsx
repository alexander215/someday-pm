import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getProjectById, updateActiveStage } from "../../lib/projects";
import { getTemplateConfig } from "../../lib/templates/index";
import ProjectTopBar from "./ProjectTopBar";
import StageNav from "./StageNav";
import StageView from "./StageView";

export default function ProjectShell() {
  const { projectId, stageKey } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const updateTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProjectById(projectId)
      .then((p) => {
        if (cancelled) return;
        setProject(p);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [projectId]);

  useEffect(() => {
    if (!project) return;
    const config = getTemplateConfig(project.template_key);
    const validKeys = config.stages.map((s) => s.stageKey);

    if (!validKeys.includes(stageKey)) {
      navigate(`/project/${projectId}/${validKeys[0]}`, { replace: true });
      return;
    }

    clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(() => {
      updateActiveStage(projectId, stageKey).catch(() => {});
    }, 400);
  }, [project, projectId, stageKey, navigate]);

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--brand-text-muted)", fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ padding: 40, color: "var(--brand-text-muted)", fontSize: 14 }}>
        {error ?? "Project not found."}
      </div>
    );
  }

  const templateConfig = getTemplateConfig(project.template_key);
  const activeStageConfig = templateConfig.stages.find((s) => s.stageKey === stageKey);

  if (!activeStageConfig) return null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <StageNav
        projectId={projectId}
        stages={templateConfig.stages}
        activeStageKey={stageKey}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          minWidth: 0,
          borderLeft: "1px solid var(--brand-border)",
        }}
      >
        <ProjectTopBar project={project} />
        <StageView project={project} stageConfig={activeStageConfig} />
      </div>
    </div>
  );
}

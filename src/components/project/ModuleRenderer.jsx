import NotesModule from "../../features/modules/NotesModule";
import TaskListModule from "../../features/modules/TaskListModule";
import OptionCardsModule from "../../features/modules/OptionCardsModule";
import PersonaCardsModule from "../../features/modules/PersonaCardsModule";
import BrainstormModule from "../../features/modules/BrainstormModule";
import CalendarModule from "../../features/modules/CalendarModule";
import CardListModule from "../../features/modules/CardListModule";
import CardBoardModule from "../../features/modules/CardBoardModule";
import CardInitiativesModule from "../../features/modules/CardInitiativesModule";
import ModuleHeader from "./ModuleHeader";

const MODULE_COMPONENTS = {
  NotesModule,
  TaskListModule,
  OptionCardsModule,
  PersonaCardsModule,
  BrainstormModule,
  CalendarModule,
  CardListModule,
  CardBoardModule,
  CardInitiativesModule,
};

export default function ModuleRenderer({ project, stageKey, moduleConfig }) {
  const Component = MODULE_COMPONENTS[moduleConfig.component];

  if (!Component) {
    return (
      <section style={{ marginBottom: 40 }}>
        <ModuleHeader label={moduleConfig.label} description={moduleConfig.description} />
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            border: "1px dashed rgba(243,231,207,0.15)",
            color: "var(--brand-text-muted)",
            fontSize: 13,
            opacity: 0.5,
          }}
        >
          {moduleConfig.component} — coming soon
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <ModuleHeader label={moduleConfig.label} description={moduleConfig.description} />
      <Component
        project={project}
        stageKey={stageKey}
        moduleConfig={moduleConfig}
      />
    </section>
  );
}

import type { BreadcrumbItem } from "@/components/layout/breadcrumb";

/** TOC entry derived from headed lesson sections. */
export type LessonTocItem = {
  id: string;
  title: string;
};

/** @deprecated Prefer LessonTocItem — kept for gradual migration. */
export type LessonSection = LessonTocItem;

export type LessonNavLink = {
  label: string;
  href: string;
  /** Soft completion styling for finishing a learning stage. */
  emphasis?: "finish";
  /** Shown as disabled — next lesson exists in curriculum but is not published yet. */
  unavailable?: boolean;
};

/**
 * Inline-formatted prose. Supports:
 * - `**bold**`
 * - `` `inline code` ``
 * - `[label](/path)` links
 */
export type RichText = string;

export type LessonTerminalSuggestion =
  | string
  | {
      command: string;
      label?: string;
    };

export type LessonTreeNode = {
  label: string;
  children?: readonly LessonTreeNode[];
};

export type LessonTerminalPreset =
  | "simple"
  | "learner-home"
  | "filesystem-lesson"
  | "users-and-groups";

export type LessonBlock =
  | {
      type: "paragraph";
      text: RichText;
    }
  | {
      type: "note";
      text: RichText;
    }
  | {
      type: "list";
      items: readonly RichText[];
      ordered?: boolean;
      /** Default: disc markers with tight spacing. */
      variant?: "disc" | "plain";
    }
  | {
      type: "heading";
      level: 3;
      text: RichText;
    }
  | {
      type: "code";
      code: string;
      language?: string;
      title?: string;
    }
  | {
      type: "callout";
      title?: string;
      text: RichText;
    }
  | {
      type: "table";
      caption: string;
      headers: readonly string[];
      /** First column renders as a row header (primary cell). */
      rows: readonly (readonly RichText[])[];
    }
  | {
      type: "definitions";
      items: readonly {
        term: string;
        description: RichText;
      }[];
    }
  | {
      type: "stack-diagram";
      layers: readonly string[];
      ariaLabel: string;
    }
  | {
      type: "composition-diagram";
      components: readonly string[];
      result: string;
      ariaLabel: string;
    }
  | {
      type: "tree-diagram";
      root: LessonTreeNode;
      ariaLabel: string;
    }
  | {
      type: "terminal";
      preset?: LessonTerminalPreset;
      includeNotes?: boolean;
      cwd?: string;
      suggestions?: readonly LessonTerminalSuggestion[];
      suggestionsLabel?: string;
    }
  | {
      type: "filesystem-explorer";
    }
  | {
      type: "exercise";
      id:
        | "first-commands-practice"
        | "filesystem-practice"
        | "users-and-groups-practice";
    }
  | {
      type: "panel";
      title: string;
      blocks: readonly LessonBlock[];
    }
  | {
      type: "compare-grid";
      columns: readonly {
        title: string;
        blocks: readonly LessonBlock[];
      }[];
    };

export type LessonContentSection = {
  id: string;
  title: string;
  blocks: readonly LessonBlock[];
};

export type LessonLevel = "beginner" | "essentials";

/** Curriculum availability — no persisted learner progress. */
export type LessonStatus = "available" | "completed" | "coming-soon";

export type Lesson = {
  slug: string;
  level: LessonLevel;
  levelNumber: string;
  /** Display label such as "Beginner". */
  difficulty: string;
  readingTime: string;
  title: string;
  /** Subtitle shown under the title in the lesson header. */
  description: string;
  /** Absolute document title when set (bypasses the site title template). */
  seoTitle?: string;
  /** Meta description when it should differ from `description`. */
  seoDescription?: string;
  breadcrumb: readonly BreadcrumbItem[];
  /** Optional blocks rendered before the first headed section (not in TOC). */
  intro?: readonly LessonBlock[];
  sections: readonly LessonContentSection[];
  navigation: {
    previous?: LessonNavLink;
    next?: LessonNavLink;
  };
};

/** Layout/chrome view of a lesson (TOC derived from sections). */
export type LessonConfig = {
  title: string;
  description: string;
  levelNumber: string;
  level: string;
  readingTime: string;
  sections: readonly LessonTocItem[];
  breadcrumb: readonly BreadcrumbItem[];
  navigation: {
    previous?: LessonNavLink;
    next?: LessonNavLink;
  };
};

export function toLessonConfig(lesson: Lesson): LessonConfig {
  return {
    title: lesson.title,
    description: lesson.description,
    levelNumber: lesson.levelNumber,
    level: lesson.difficulty,
    readingTime: lesson.readingTime,
    sections: lesson.sections.map(({ id, title }) => ({ id, title })),
    breadcrumb: lesson.breadcrumb,
    navigation: lesson.navigation,
  };
}

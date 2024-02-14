import { jest } from "@jest/globals";
import { MessageRole, apiDataToStorage, stateToMessagePath } from "./use-ai";
import { AIHelpLog, MetaType } from "./rust-types";

const data: AIHelpLog = {
  chat_id: "a2befad4-be1e-4b01-8d09-e45bebfee490",
  messages: [
    {
      metadata: {
        type: MetaType.Metadata,
        chat_id: "a2befad4-be1e-4b01-8d09-e45bebfee490",
        message_id: "5d49b710-20ad-4371-a92f-a283c26e2a7f",
        parent_id: null,
        sources: [
          {
            url: "/en-US/docs/Learn/CSS/Howto/Center_an_item",
            title: "How to center an item",
          },
          {
            url: "/en-US/docs/Web/CSS/Layout_cookbook/Center_an_element",
            title: "Center an element",
          },
          { url: "/en-US/docs/Learn/CSS/Howto/CSS_FAQ", title: "CSS FAQ" },
          {
            url: "/en-US/docs/Learn/CSS/Howto/Create_fancy_boxes",
            title: "Create fancy boxes",
          },
          { url: "/en-US/docs/Web/CSS/place-content", title: "place-content" },
        ],
        quota: null,
        created_at: "2024-02-13T17:05:51.171127Z",
      },
      user: { role: "user", content: "How to center a div with CSS?" },
      assistant: {
        role: "assistant",
        content: "To center a `div` element ...",
      },
    },
    {
      metadata: {
        type: MetaType.Metadata,
        chat_id: "a2befad4-be1e-4b01-8d09-e45bebfee490",
        message_id: "ba70e34a-9fc2-4e57-88f7-f4bb8c5a46ef",
        parent_id: "5d49b710-20ad-4371-a92f-a283c26e2a7f",
        sources: [
          {
            url: "/en-US/docs/Learn/CSS/Howto/Center_an_item",
            title: "How to center an item",
          },
          {
            url: "/en-US/docs/Web/CSS/Layout_cookbook/Center_an_element",
            title: "Center an element",
          },
          {
            url: "/en-US/docs/Web/CSS/vertical-align",
            title: "vertical-align",
          },
          {
            url: "/en-US/docs/Web/CSS/CSS_flexible_box_layout/Aligning_items_in_a_flex_container",
            title: "Aligning items in a flex container",
          },
          { url: "/en-US/docs/Web/CSS/justify-self", title: "justify-self" },
        ],
        quota: null,
        created_at: "2024-02-13T17:06:52.596985Z",
      },
      user: { role: "user", content: "How to center it vertically only?" },
      assistant: {
        role: "assistant",
        content: "To center a `div` ...",
      },
    },
    {
      metadata: {
        type: MetaType.Metadata,
        chat_id: "a2befad4-be1e-4b01-8d09-e45bebfee490",
        message_id: "e853350f-4c83-4cfd-ad7b-a33a13e8f53f",
        parent_id: "5d49b710-20ad-4371-a92f-a283c26e2a7f",
        sources: [
          {
            url: "/en-US/docs/Learn/CSS/Howto/Center_an_item",
            title: "How to center an item",
          },
          {
            url: "/en-US/docs/Web/CSS/Layout_cookbook/Center_an_element",
            title: "Center an element",
          },
          {
            url: "/en-US/docs/Web/CSS/CSS_flexible_box_layout/Aligning_items_in_a_flex_container",
            title: "Aligning items in a flex container",
          },
          { url: "/en-US/docs/Web/CSS/text-align", title: "text-align" },
          {
            url: "/en-US/docs/Learn/CSS/Building_blocks/Writing_Modes_Tasks",
            title: "Test your skills: Writing modes and logical properties",
          },
        ],
        quota: null,
        created_at: "2024-02-13T17:07:53.234230Z",
      },
      user: { role: "user", content: "How to center it horizontally only?" },
      assistant: {
        role: "assistant",
        content: "To center a `div` vertically ...",
      },
    },
    {
      metadata: {
        type: MetaType.Metadata,
        chat_id: "a2befad4-be1e-4b01-8d09-e45bebfee490",
        message_id: "e844b41e-1648-463a-875b-e7bfc2479c77",
        parent_id: "5d49b710-20ad-4371-a92f-a283c26e2a7f",
        sources: [
          {
            url: "/en-US/docs/Learn/Common_questions/Tools_and_setup/How_much_does_it_cost",
            title: "How much does it cost to do something on the Web?",
          },
          { url: "/en-US/docs/Glossary/FPS", title: "Frame rate (FPS)" },
          { url: "/en-US/docs/Glossary/FTU", title: "FTU" },
          {
            url: "/en-US/docs/Games/Tutorials/2D_breakout_game_Phaser/Player_paddle_and_controls",
            title: "Player paddle and controls",
          },
          {
            url: "/en-US/docs/Web/SVG/Namespaces_Crash_Course/Example",
            title: "Example",
          },
        ],
        quota: null,
        created_at: "2024-02-14T08:52:42.178701Z",
      },
      user: { role: "user", content: "How much is the fish?" },
      assistant: {
        role: "assistant",
        content:
          "I'm sorry, but I can only provide assistance with web development topics...",
      },
    },
    {
      metadata: {
        type: MetaType.Metadata,
        chat_id: "a2befad4-be1e-4b01-8d09-e45bebfee490",
        message_id: "c863991c-d44b-4c33-9725-06a5f0d9add9",
        parent_id: "5d49b710-20ad-4371-a92f-a283c26e2a7f",
        sources: [
          {
            url: "/en-US/docs/Learn/Common_questions/Tools_and_setup/How_much_does_it_cost",
            title: "How much does it cost to do something on the Web?",
          },
          {
            url: "/en-US/docs/Games/Publishing_games/Game_monetization",
            title: "Game monetization",
          },
          { url: "/en-US/docs/Web/CSS/actual_value", title: "Actual value" },
          {
            url: "/en-US/docs/Web/Performance/Fundamentals",
            title: "Performance fundamentals",
          },
          { url: "/en-US/docs/Glossary/CSS_pixel", title: "CSS pixel" },
        ],
        quota: null,
        created_at: "2024-02-14T09:07:26.459750Z",
      },
      user: { role: "user", content: "How much really?" },
      assistant: {
        role: "assistant",
        content: "To center a `div` horizontally and vertically with CSS...",
      },
    },
  ],
};

const state = apiDataToStorage(data, data.chat_id);

describe("Testing ai-help utility code", () => {
  it("test stateToMessagePath with traverseWithDefault", async () => {
    expect(stateToMessagePath(state.treeState!, [])).toEqual([]);
    expect(stateToMessagePath(state.treeState!, [], true)).toHaveLength(4);

    expect(stateToMessagePath(state.treeState!, [0, 0])).toHaveLength(4);
    expect(stateToMessagePath(state.treeState!, [0, 1])).toHaveLength(4);
    expect(stateToMessagePath(state.treeState!, [0, 2], true)).toHaveLength(4);
    expect(stateToMessagePath(state.treeState!, [0], true)).toHaveLength(4);
    expect(stateToMessagePath(state.treeState!, [0])).toHaveLength(2);

    expect(
      stateToMessagePath(state.treeState!, [0, 0])
        .filter((x) => x?.role === MessageRole.User)
        .map((x) => x.messageId)
    ).toEqual([
      "5d49b710-20ad-4371-a92f-a283c26e2a7f",
      "ba70e34a-9fc2-4e57-88f7-f4bb8c5a46ef",
    ]);

    expect(
      stateToMessagePath(state.treeState!, [0, 2])
        .filter((x) => x?.role === MessageRole.User)
        .map((x) => x.messageId)
    ).toEqual([
      "5d49b710-20ad-4371-a92f-a283c26e2a7f",
      "e844b41e-1648-463a-875b-e7bfc2479c77",
    ]);
  });
});

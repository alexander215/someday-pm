import { supabase } from "./supabase";

const REACTION_ORDER = { smile: 0, neutral: 1, sad: 2 };

function sortByDefault(ideas) {
  return [...ideas].sort((a, b) => {
    const rd = REACTION_ORDER[a.reaction] - REACTION_ORDER[b.reaction];
    return rd !== 0 ? rd : new Date(a.created_at) - new Date(b.created_at);
  });
}

export async function getBrainstormBoardsForCard(cardId) {
  const { data, error } = await supabase
    .from("brainstorm_boards")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createBrainstormBoard({ cardId, title }) {
  const { data, error } = await supabase
    .from("brainstorm_boards")
    .insert({ card_id: cardId, title: title.trim() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBrainstormBoard(id) {
  const { error } = await supabase
    .from("brainstorm_boards")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getBrainstormBoard(boardId) {
  const { data: board, error: boardErr } = await supabase
    .from("brainstorm_boards")
    .select("*")
    .eq("id", boardId)
    .single();
  if (boardErr) throw new Error(boardErr.message);

  const { data: ideas, error: ideasErr } = await supabase
    .from("brainstorm_ideas")
    .select("*")
    .eq("board_id", boardId);
  if (ideasErr) throw new Error(ideasErr.message);

  const sorted = board.use_custom_order
    ? [...ideas].sort((a, b) => (a.sort_position ?? 0) - (b.sort_position ?? 0))
    : sortByDefault(ideas);

  return { ...board, ideas: sorted };
}

export async function createBrainstormIdea({ boardId, text }) {
  const { data, error } = await supabase
    .from("brainstorm_ideas")
    .insert({ board_id: boardId, text: text.trim() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBrainstormIdeaReaction(id, reaction) {
  const { data, error } = await supabase
    .from("brainstorm_ideas")
    .update({ reaction })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBrainstormIdeaNote(id, note) {
  const { data, error } = await supabase
    .from("brainstorm_ideas")
    .update({ note: note || null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBrainstormIdea(id) {
  const { error } = await supabase
    .from("brainstorm_ideas")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderBrainstormIdeas(boardId, orderedIds) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("brainstorm_ideas")
        .update({ sort_position: index })
        .eq("id", id)
    )
  );
  const { error } = await supabase
    .from("brainstorm_boards")
    .update({ use_custom_order: true })
    .eq("id", boardId);
  if (error) throw new Error(error.message);
}

export async function resetBrainstormOrder(boardId) {
  const { error } = await supabase
    .from("brainstorm_boards")
    .update({ use_custom_order: false })
    .eq("id", boardId);
  if (error) throw new Error(error.message);
}

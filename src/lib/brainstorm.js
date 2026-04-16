import { supabase } from "./supabase";

export async function getBrainstormCardsForCard(cardId) {
  const { data, error } = await supabase
    .from("brainstorm_cards")
    .select("*, brainstorm_entries(*)")
    .eq("card_id", cardId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data.map((card) => ({
    ...card,
    brainstorm_entries: [...(card.brainstorm_entries || [])].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    ),
  }));
}

export async function createBrainstormCard({ cardId, title }) {
  const { data, error } = await supabase
    .from("brainstorm_cards")
    .insert({ card_id: cardId, title: title.trim() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...data, brainstorm_entries: [] };
}

export async function deleteBrainstormCard(id) {
  const { error } = await supabase
    .from("brainstorm_cards")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createBrainstormEntry({ brainstormCardId, text }) {
  const { data, error } = await supabase
    .from("brainstorm_entries")
    .insert({ brainstorm_card_id: brainstormCardId, text: text.trim() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBrainstormEntryScore(id, score) {
  const { data, error } = await supabase
    .from("brainstorm_entries")
    .update({ score })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBrainstormEntry(id) {
  const { error } = await supabase
    .from("brainstorm_entries")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

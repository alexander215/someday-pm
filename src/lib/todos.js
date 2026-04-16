import { supabase } from "./supabase";

export async function getTodosForCard(cardId) {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("card_id", cardId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createTodo(cardId, text) {
  const { data, error } = await supabase
    .from("todos")
    .insert({ card_id: cardId, text: text.trim(), sort_order: Date.now() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function toggleTodo(todoId, completed) {
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", todoId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTodo(todoId) {
  const { error } = await supabase.from("todos").delete().eq("id", todoId);
  if (error) throw new Error(error.message);
}

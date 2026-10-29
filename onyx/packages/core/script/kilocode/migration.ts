function board(name: string) {
  return /(?:^|_)kilocode_board(?:_reset)?$/.test(name)
}

export function file(name: string, value: string) {
  return board(name) ? `// onyx_change - new file\n${value}` : value
}

export function block(name: string | undefined, source: string, value: string) {
  return (name !== undefined && board(name)) ||
    /kilo_board(?:_message)?|part_session_step_finish_idx|recall_(?:part_search|message_role)_idx/.test(source)
    ? `// onyx_change start\n${value}\n// onyx_change end`
    : value
}

export function line(name: string, value: string) {
  return board(name) || name.endsWith("_kilocode_model_usage_index") ? `${value} // onyx_change` : value
}

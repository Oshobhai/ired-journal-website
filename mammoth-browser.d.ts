declare module 'mammoth/mammoth.browser' {
  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: { includeDefaultStyleMap?: boolean }
  ): Promise<{ value: string; messages: Array<{ type: string; message: string }> }>

  const mammoth: { convertToHtml: typeof convertToHtml }
  export default mammoth
}

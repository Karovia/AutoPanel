export type PluginHostClient = {
  call<T>(method: string, params: unknown): Promise<T>;
};

export function createPluginHost(): PluginHostClient {
  return {
    async call<T>(method: string, params: unknown): Promise<T> {
      window.parent.postMessage({ source: "plugin", method, params }, "*");
      return Promise.resolve(undefined as T);
    },
  };
}

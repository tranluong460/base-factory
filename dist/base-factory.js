import { CoreLogger as p, BaseClass as d } from "@vitechgroup/mkt-elec-core";
const m = (e, t, a) => {
  const r = e[t];
  return r ? typeof r == "function" ? r() : Promise.resolve(r) : new Promise((n, c) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(
      c.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + t + (t.split("/").length !== a ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
class u {
  static async loadPlugin(t) {
    try {
      const a = await m(/* @__PURE__ */ Object.assign({ "../providers/automated/index.ts": () => Promise.resolve().then(() => v), "../providers/direct_api/index.ts": () => Promise.resolve().then(() => $), "../providers/scripted/index.ts": () => Promise.resolve().then(() => U), "../providers/shared/index.ts": () => Promise.resolve().then(() => _) }), `../providers/${t}/index.ts`, 4);
      if (a.register)
        a.register();
      else
        throw new Error(`[Plugin Loader] No register in ${t}`);
    } catch (a) {
      throw p.getInstance().error(`[Plugin Loader] Failed to load ${t}:`, a), a;
    }
  }
}
class I {
  static async getProvider(t) {
    return await u.loadPlugin(t.type), o.getFactory(t.type).create(t);
  }
}
class o {
  static factories = /* @__PURE__ */ new Map();
  static register(t, a) {
    this.factories.set(t, a);
  }
  static getFactory(t) {
    const a = this.factories.get(t);
    if (!a)
      throw new Error(`[Provider Registry] No factory registered for '${t}'`);
    return a;
  }
  static listProviders() {
    return Array.from(this.factories.keys());
  }
}
const g = {
  automated: {
    action_example: {
      start: "Start action example for automated {{1}} | Key target: {{0}}",
      end: "End action example for automated {{1}} | Key target: {{0}}"
    }
  },
  direct_api: {
    action_example: {
      start: "Start action example for direct_api {{1}} | Key target: {{0}}",
      end: "End action example for direct_api {{1}} | Key target: {{0}}"
    }
  },
  scripted: {
    action_example: {
      start: "Start action example for scripted {{1}} | Key target: {{0}}",
      end: "End action example for scripted {{1}} | Key target: {{0}}"
    }
  }
}, M = {
  log_process_run: g
}, y = {
  automated: {
    action_example: {
      start: "자동화에 대한 액션 예제 시작 {{1}} | 대상 키: {{0}}",
      end: "자동화에 대한 액션 예제 종료 {{1}} | 대상 키: {{0}}"
    }
  },
  direct_api: {
    action_example: {
      start: "Direct API에 대한 액션 예제 시작 {{1}} | 대상 키: {{0}}",
      end: "Direct API에 대한 액션 예제 종료 {{1}} | 대상 키: {{0}}"
    }
  },
  scripted: {
    action_example: {
      start: "스크립트에 대한 액션 예제 시작 {{1}} | 대상 키: {{0}}",
      end: "스크립트에 대한 액션 예제 종료 {{1}} | 대상 키: {{0}}"
    }
  }
}, C = {
  log_process_run: y
}, h = {
  automated: {
    action_example: {
      start: "Bắt đầu thực hiện action example cho automated {{1}} | Key target: {{0}}",
      end: "Kết thúc thực hiện action example cho automated {{1}} | Key target: {{0}}"
    }
  },
  direct_api: {
    action_example: {
      start: "Bắt đầu thực hiện action example cho direct_api {{1}} | Key target: {{0}}",
      end: "Kết thúc thực hiện action example cho direct_api {{1}} | Key target: {{0}}"
    }
  },
  scripted: {
    action_example: {
      start: "Bắt đầu thực hiện action example cho scripted {{1}} | Key target: {{0}}",
      end: "Kết thúc thực hiện action example cho scripted {{1}} | Key target: {{0}}"
    }
  }
}, F = {
  log_process_run: h
};
var i = /* @__PURE__ */ ((e) => (e.SCRIPTED = "scripted", e.AUTOMATED = "automated", e.DIRECT_API = "direct_api", e))(i || {});
class s extends d {
  payload;
  actionKey;
  constructor(t, a) {
    super(), this.payload = t, this.actionKey = a;
  }
  async logUpdate(t, a = [], r) {
    const n = [this.payload.keyTarget, ...a].filter((l) => l !== ""), c = n.length > 0 ? `|${n.join("|")}` : "";
    await this.payload.logUpdate({
      action: this.actionKey,
      key: t,
      mess: `${this.actionKey}.${t}${c}`,
      // Format: action.key|param1|param2|...
      success: r,
      uidTarget: this.payload.keyTarget
    });
  }
}
const _ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  LabsBaseClass: s
}, Symbol.toStringTag, { value: "Module" }));
let x = class extends s {
  constructor(t) {
    super(t, "automated.action_example");
  }
  async start() {
    await this.logUpdate("start", [123]), await this.logUpdate("end", [456]);
  }
};
class f {
  constructor(t) {
    this.payload = t, this.actionExample = new x(this.payload);
  }
  actionExample;
  async start() {
    await this.actionExample.start();
  }
}
class w {
  create(t) {
    return new f(t);
  }
}
function P() {
  o.register(i.AUTOMATED, new w());
}
const v = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  register: P
}, Symbol.toStringTag, { value: "Module" }));
let E = class extends s {
  constructor(t) {
    super(t, "direct_api.action_example");
  }
  async start() {
    await this.logUpdate("start", [123]), await this.logUpdate("end", [456]);
  }
};
class K {
  constructor(t) {
    this.payload = t, this.actionExample = new E(this.payload);
  }
  actionExample;
  async start() {
    await this.actionExample.start();
  }
}
class b {
  create(t) {
    return new K(t);
  }
}
function A() {
  o.register(i.DIRECT_API, new b());
}
const $ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  register: A
}, Symbol.toStringTag, { value: "Module" }));
class S extends s {
  constructor(t) {
    super(t, "scripted.action_example");
  }
  async start() {
    await this.logUpdate("start", [123]), await this.logUpdate("end", [456]);
  }
}
class T {
  constructor(t) {
    this.payload = t, this.actionExample = new S(this.payload);
  }
  actionExample;
  async start() {
    await this.actionExample.start();
  }
}
class O {
  create(t) {
    return new T(t);
  }
}
function D() {
  o.register(i.SCRIPTED, new O());
}
const U = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  register: D
}, Symbol.toStringTag, { value: "Module" }));
export {
  M as EN,
  i as EnumLabsProvider,
  C as KO,
  u as LabsPluginLoader,
  I as LabsProviderFacade,
  o as LabsProviderRegistry,
  F as VI
};

type ZeroFn = () => void;

class ZeroPointRegistry {
    private fns = new Set<ZeroFn>();

    register(fn: ZeroFn) {
        this.fns.add(fn);
        return () => this.fns.delete(fn);
    }

    runAll() {
        this.fns.forEach(fn => fn());
    }
}

export const zeroPointRegistry = new ZeroPointRegistry();
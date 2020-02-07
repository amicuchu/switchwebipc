## Pitfalls

1. Be sure that touch event target isn't an element that can disappear or touchend won't work (The target is the topest touched element, not the element that has the handlers, use pointerEvents for make an element uncapable of being target)
2. Position of event handlers done by react is document in bubbling phase, any behaviour that depends on stoping propagation won't work
3. Give callbacks can potentially make a stale closure (like event handlers), use the pattern of useState + useEffect
4. Ref.current dependency in useEffect can be triggered multiple times, put guards for behaviours that must be done once
5. useMemo executes if dependencies change and element renders, if dependency change and element isn't rendered, won't be triggered. Use effects
6. Webkit GC will destroy unreferenced objects even if they have an event handler to call later (Animations)
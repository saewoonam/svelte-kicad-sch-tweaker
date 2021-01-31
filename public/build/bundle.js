
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function getEventsAction(component) {
        return node => {
          const events = Object.keys(component.$$.callbacks);
          const listeners = [];

          events.forEach(
              event => listeners.push(
                  listen(node, event, e =>  bubble(component, e))
                )
            );
      
          return {
            destroy: () => {
                listeners.forEach(
                    listener => listener()
                );
            }
          }
        };
    }

    /* node_modules/svelte-chota/cmp/Card.svelte generated by Svelte v3.32.1 */
    const file = "node_modules/svelte-chota/cmp/Card.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (12:0) {#if is_header}
    function create_if_block_1(ctx) {
    	let header;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[5].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[4], get_header_slot_context);

    	const block = {
    		c: function create() {
    			header = element("header");
    			if (header_slot) header_slot.c();
    			add_location(header, file, 12, 1, 392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);

    			if (header_slot) {
    				header_slot.m(header, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (header_slot) header_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(12:0) {#if is_header}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if is_footer}
    function create_if_block(ctx) {
    	let footer;
    	let current;
    	const footer_slot_template = /*#slots*/ ctx[5].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[4], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			if (footer_slot) footer_slot.c();
    			add_location(footer, file, 18, 1, 485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);

    			if (footer_slot) {
    				footer_slot.m(footer, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if (footer_slot) footer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(18:0) {#if is_footer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*is_header*/ ctx[1] && create_if_block_1(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let if_block1 = /*is_footer*/ ctx[2] && create_if_block(ctx);
    	let div_levels = [/*$$restProps*/ ctx[3]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "card", 1);
    			add_location(div, file, 10, 0, 326);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*events*/ ctx[0].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*is_header*/ ctx[1]) if_block0.p(ctx, dirty);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (/*is_footer*/ ctx[2]) if_block1.p(ctx, dirty);
    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			toggle_class(div, "card", 1);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['header','default','footer']);
    	const events = getEventsAction(current_component);
    	let is_header = $$props.$$slots && $$props.$$slots.header !== undefined;
    	let is_footer = $$props.$$slots && $$props.$$slots.footer !== undefined;

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		current_component,
    		events,
    		is_header,
    		is_footer
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("is_header" in $$props) $$invalidate(1, is_header = $$new_props.is_header);
    		if ("is_footer" in $$props) $$invalidate(2, is_footer = $$new_props.is_footer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [events, is_header, is_footer, $$restProps, $$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* node_modules/svelte-chota/cmp/Icon.svelte generated by Svelte v3.32.1 */
    const file$1 = "node_modules/svelte-chota/cmp/Icon.svelte";

    // (80:0) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*spin*/ ctx[0] !== false) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);
    	let svg_levels = [{ viewBox: "0 0 24 24" }, { style: /*style*/ ctx[6] }, /*$$restProps*/ ctx[9]];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if_block.c();
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "svelte-1q4wean", true);
    			add_location(svg, file$1, 80, 1, 2115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if_block.m(svg, null);

    			if (!mounted) {
    				dispose = action_destroyer(/*events*/ ctx[8].call(null, svg));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(svg, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 24 24" },
    				dirty & /*style*/ 64 && { style: /*style*/ ctx[6] },
    				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9]
    			]));

    			toggle_class(svg, "svelte-1q4wean", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(80:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:14) 
    function create_if_block_1$1(ctx) {
    	let svg;
    	let use_1;
    	let mounted;
    	let dispose;
    	let svg_levels = [{ viewBox: "0 0 24 24" }, { style: /*style*/ ctx[6] }, /*$$restProps*/ ctx[9]];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			use_1 = svg_element("use");
    			xlink_attr(use_1, "xlink:href", /*use*/ ctx[2]);
    			attr_dev(use_1, "style", /*aniStyle*/ ctx[7]);
    			attr_dev(use_1, "class", "svelte-1q4wean");
    			toggle_class(use_1, "spinCW", /*spinCW*/ ctx[4]);
    			toggle_class(use_1, "spinCCW", /*spinCCW*/ ctx[5]);
    			add_location(use_1, file$1, 77, 2, 2025);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "svelte-1q4wean", true);
    			add_location(svg, file$1, 76, 1, 1961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, use_1);

    			if (!mounted) {
    				dispose = action_destroyer(/*events*/ ctx[8].call(null, svg));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*use*/ 4) {
    				xlink_attr(use_1, "xlink:href", /*use*/ ctx[2]);
    			}

    			if (dirty & /*aniStyle*/ 128) {
    				attr_dev(use_1, "style", /*aniStyle*/ ctx[7]);
    			}

    			if (dirty & /*spinCW*/ 16) {
    				toggle_class(use_1, "spinCW", /*spinCW*/ ctx[4]);
    			}

    			if (dirty & /*spinCCW*/ 32) {
    				toggle_class(use_1, "spinCCW", /*spinCCW*/ ctx[5]);
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ viewBox: "0 0 24 24" },
    				dirty & /*style*/ 64 && { style: /*style*/ ctx[6] },
    				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9]
    			]));

    			toggle_class(svg, "svelte-1q4wean", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(76:14) ",
    		ctx
    	});

    	return block;
    }

    // (72:0) {#if url}
    function create_if_block$1(ctx) {
    	let span;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;
    	let span_levels = [{ style: /*style*/ ctx[6] }, /*$$restProps*/ ctx[9]];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			img = element("img");
    			if (img.src !== (img_src_value = /*url*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "100%");
    			attr_dev(img, "height", "100%");
    			attr_dev(img, "style", /*aniStyle*/ ctx[7]);
    			attr_dev(img, "class", "svelte-1q4wean");
    			toggle_class(img, "spinCW", /*spinCW*/ ctx[4]);
    			toggle_class(img, "spinCCW", /*spinCCW*/ ctx[5]);
    			add_location(img, file$1, 73, 2, 1838);
    			set_attributes(span, span_data);
    			toggle_class(span, "svelte-1q4wean", true);
    			add_location(span, file$1, 72, 1, 1793);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, img);

    			if (!mounted) {
    				dispose = action_destroyer(/*events*/ ctx[8].call(null, span));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*url*/ 8 && img.src !== (img_src_value = /*url*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*aniStyle*/ 128) {
    				attr_dev(img, "style", /*aniStyle*/ ctx[7]);
    			}

    			if (dirty & /*spinCW*/ 16) {
    				toggle_class(img, "spinCW", /*spinCW*/ ctx[4]);
    			}

    			if (dirty & /*spinCCW*/ 32) {
    				toggle_class(img, "spinCCW", /*spinCCW*/ ctx[5]);
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				dirty & /*style*/ 64 && { style: /*style*/ ctx[6] },
    				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9]
    			]));

    			toggle_class(span, "svelte-1q4wean", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(72:0) {#if url}",
    		ctx
    	});

    	return block;
    }

    // (86:1) {:else}
    function create_else_block_1(ctx) {
    	let path_1;

    	const block = {
    		c: function create() {
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", /*path*/ ctx[1]);
    			add_location(path_1, file$1, 86, 2, 2293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 2) {
    				attr_dev(path_1, "d", /*path*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(86:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (82:1) {#if spin !== false}
    function create_if_block_2(ctx) {
    	let g;
    	let path_1;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", /*path*/ ctx[1]);
    			add_location(path_1, file$1, 83, 3, 2252);
    			attr_dev(g, "style", /*aniStyle*/ ctx[7]);
    			attr_dev(g, "class", "svelte-1q4wean");
    			toggle_class(g, "spinCW", /*spinCW*/ ctx[4]);
    			toggle_class(g, "spinCCW", /*spinCCW*/ ctx[5]);
    			add_location(g, file$1, 82, 2, 2201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path_1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path*/ 2) {
    				attr_dev(path_1, "d", /*path*/ ctx[1]);
    			}

    			if (dirty & /*aniStyle*/ 128) {
    				attr_dev(g, "style", /*aniStyle*/ ctx[7]);
    			}

    			if (dirty & /*spinCW*/ 16) {
    				toggle_class(g, "spinCW", /*spinCW*/ ctx[4]);
    			}

    			if (dirty & /*spinCCW*/ 32) {
    				toggle_class(g, "spinCCW", /*spinCCW*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(82:1) {#if spin !== false}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*url*/ ctx[3]) return create_if_block$1;
    		if (/*use*/ ctx[2]) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let inverse;
    	let spintime;
    	let spinCW;
    	let spinCCW;
    	let style;
    	let aniStyle;
    	const omit_props_names = ["src","size","color","flipH","flipV","rotate","spin"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, []);
    	const events = getEventsAction(current_component);
    	let { src = null } = $$props;
    	let { size = 1 } = $$props;
    	let { color = null } = $$props;
    	let { flipH = null } = $$props;
    	let { flipV = null } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let path = false;
    	let use = false;
    	let url = false;

    	// size
    	if (Number(size)) size = Number(size);

    	// styles
    	const getStyles = () => {
    		const transform = [];
    		const styles = [];

    		if (size !== null) {
    			const width = typeof size === "string" ? size : `${size * 1.5}rem`;
    			styles.push(["width", width]);
    			styles.push(["height", width]);
    		}

    		styles.push(["fill", color !== null ? color : "currentColor"]);

    		if (flipH) {
    			transform.push("scaleX(-1)");
    		}

    		if (flipV) {
    			transform.push("scaleY(-1)");
    		}

    		if (rotate != 0) {
    			transform.push(`rotate(${rotate}deg)`);
    		}

    		if (transform.length > 0) {
    			styles.push(["transform", transform.join(" ")]);
    			styles.push(["transform-origin", "center"]);
    		}

    		return styles.reduce(
    			(cur, item) => {
    				return `${cur} ${item[0]}:${item[1]};`;
    			},
    			""
    		);
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("src" in $$new_props) $$invalidate(11, src = $$new_props.src);
    		if ("size" in $$new_props) $$invalidate(10, size = $$new_props.size);
    		if ("color" in $$new_props) $$invalidate(12, color = $$new_props.color);
    		if ("flipH" in $$new_props) $$invalidate(13, flipH = $$new_props.flipH);
    		if ("flipV" in $$new_props) $$invalidate(14, flipV = $$new_props.flipV);
    		if ("rotate" in $$new_props) $$invalidate(15, rotate = $$new_props.rotate);
    		if ("spin" in $$new_props) $$invalidate(0, spin = $$new_props.spin);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		current_component,
    		events,
    		src,
    		size,
    		color,
    		flipH,
    		flipV,
    		rotate,
    		spin,
    		path,
    		use,
    		url,
    		getStyles,
    		inverse,
    		spintime,
    		spinCW,
    		spinCCW,
    		style,
    		aniStyle
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("src" in $$props) $$invalidate(11, src = $$new_props.src);
    		if ("size" in $$props) $$invalidate(10, size = $$new_props.size);
    		if ("color" in $$props) $$invalidate(12, color = $$new_props.color);
    		if ("flipH" in $$props) $$invalidate(13, flipH = $$new_props.flipH);
    		if ("flipV" in $$props) $$invalidate(14, flipV = $$new_props.flipV);
    		if ("rotate" in $$props) $$invalidate(15, rotate = $$new_props.rotate);
    		if ("spin" in $$props) $$invalidate(0, spin = $$new_props.spin);
    		if ("path" in $$props) $$invalidate(1, path = $$new_props.path);
    		if ("use" in $$props) $$invalidate(2, use = $$new_props.use);
    		if ("url" in $$props) $$invalidate(3, url = $$new_props.url);
    		if ("inverse" in $$props) $$invalidate(16, inverse = $$new_props.inverse);
    		if ("spintime" in $$props) $$invalidate(17, spintime = $$new_props.spintime);
    		if ("spinCW" in $$props) $$invalidate(4, spinCW = $$new_props.spinCW);
    		if ("spinCCW" in $$props) $$invalidate(5, spinCCW = $$new_props.spinCCW);
    		if ("style" in $$props) $$invalidate(6, style = $$new_props.style);
    		if ("aniStyle" in $$props) $$invalidate(7, aniStyle = $$new_props.aniStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*src*/ 2048) {
    			//Icon source
    			 if (!!src && src.toLowerCase().trim().endsWith(".svg")) {
    				$$invalidate(3, url = src);
    				$$invalidate(1, path = $$invalidate(2, use = false));
    			} else if (!!src && src.toLowerCase().trim().includes(".svg#")) {
    				$$invalidate(2, use = src);
    				$$invalidate(3, url = $$invalidate(1, path = false));
    			} else if (!!src) {
    				$$invalidate(1, path = src);
    				$$invalidate(3, url = $$invalidate(2, use = false));
    			}
    		}

    		if ($$self.$$.dirty & /*spin*/ 1) {
    			// SPIN properties
    			 $$invalidate(16, inverse = typeof spin !== "boolean" && spin < 0 ? true : false);
    		}

    		if ($$self.$$.dirty & /*spin*/ 1) {
    			 $$invalidate(17, spintime = Math.abs(spin === true ? 2 : spin));
    		}

    		if ($$self.$$.dirty & /*spin, inverse*/ 65537) {
    			 $$invalidate(4, spinCW = !!spin && !inverse);
    		}

    		if ($$self.$$.dirty & /*spin, inverse*/ 65537) {
    			 $$invalidate(5, spinCCW = !!spin && inverse);
    		}

    		if ($$self.$$.dirty & /*size, color, flipH, flipV, rotate*/ 62464) {
    			 $$invalidate(6, style = getStyles());
    		}

    		if ($$self.$$.dirty & /*spin, spintime*/ 131073) {
    			 $$invalidate(7, aniStyle = !!spin ? `animation-duration: ${spintime}s` : undefined);
    		}
    	};

    	return [
    		spin,
    		path,
    		use,
    		url,
    		spinCW,
    		spinCCW,
    		style,
    		aniStyle,
    		events,
    		$$restProps,
    		size,
    		src,
    		color,
    		flipH,
    		flipV,
    		rotate,
    		inverse,
    		spintime
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			src: 11,
    			size: 10,
    			color: 12,
    			flipH: 13,
    			flipV: 14,
    			rotate: 15,
    			spin: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get src() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flipH() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flipH(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flipV() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flipV(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-chota/cmp/Button.svelte generated by Svelte v3.32.1 */
    const file$2 = "node_modules/svelte-chota/cmp/Button.svelte";

    // (87:0) {:else}
    function create_else_block$1(ctx) {
    	let details;
    	let summary;
    	let t0;

    	let t1_value = (/*dropdown*/ ctx[11] !== true
    	? /*dropdown*/ ctx[11]
    	: "") + "";

    	let t1;
    	let t2;
    	let t3;
    	let card;
    	let dropdownAction_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[9] && create_if_block_4(ctx);
    	let if_block1 = /*iconRight*/ ctx[10] && create_if_block_3(ctx);
    	let summary_levels = [/*$$restProps*/ ctx[17]];
    	let summary_data = {};

    	for (let i = 0; i < summary_levels.length; i += 1) {
    		summary_data = assign(summary_data, summary_levels[i]);
    	}

    	card = new Card({
    			props: {
    				style: "z-index:1",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			details = element("details");
    			summary = element("summary");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			create_component(card.$$.fragment);
    			set_attributes(summary, summary_data);
    			toggle_class(summary, "success", /*success*/ ctx[6]);
    			toggle_class(summary, "button", 1);
    			toggle_class(summary, "primary", /*primary*/ ctx[2]);
    			toggle_class(summary, "secondary", /*secondary*/ ctx[3]);
    			toggle_class(summary, "dark", /*dark*/ ctx[4]);
    			toggle_class(summary, "error", /*error*/ ctx[5]);
    			toggle_class(summary, "outline", /*outline*/ ctx[1]);
    			toggle_class(summary, "clear", /*clear*/ ctx[7]);
    			toggle_class(summary, "loading", /*loading*/ ctx[8]);
    			toggle_class(summary, "icon", /*clIcon*/ ctx[14]);
    			toggle_class(summary, "icon-only", /*clIcononly*/ ctx[15]);
    			toggle_class(summary, "svelte-1o5ccdl", true);
    			add_location(summary, file$2, 88, 4, 2367);
    			attr_dev(details, "class", "dropdown");
    			add_location(details, file$2, 87, 2, 2295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, details, anchor);
    			append_dev(details, summary);
    			if (if_block0) if_block0.m(summary, null);
    			append_dev(summary, t0);
    			append_dev(summary, t1);
    			append_dev(summary, t2);
    			if (if_block1) if_block1.m(summary, null);
    			append_dev(details, t3);
    			mount_component(card, details, null);
    			details.open = /*open*/ ctx[0];
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*events*/ ctx[16].call(null, summary)),
    					listen_dev(details, "toggle", /*details_toggle_handler*/ ctx[19]),
    					action_destroyer(dropdownAction_action = dropdownAction.call(null, details, /*autoclose*/ ctx[12]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*icon*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(summary, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*dropdown*/ 2048) && t1_value !== (t1_value = (/*dropdown*/ ctx[11] !== true
    			? /*dropdown*/ ctx[11]
    			: "") + "")) set_data_dev(t1, t1_value);

    			if (/*iconRight*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(summary, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(summary, summary_data = get_spread_update(summary_levels, [dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]]));
    			toggle_class(summary, "success", /*success*/ ctx[6]);
    			toggle_class(summary, "button", 1);
    			toggle_class(summary, "primary", /*primary*/ ctx[2]);
    			toggle_class(summary, "secondary", /*secondary*/ ctx[3]);
    			toggle_class(summary, "dark", /*dark*/ ctx[4]);
    			toggle_class(summary, "error", /*error*/ ctx[5]);
    			toggle_class(summary, "outline", /*outline*/ ctx[1]);
    			toggle_class(summary, "clear", /*clear*/ ctx[7]);
    			toggle_class(summary, "loading", /*loading*/ ctx[8]);
    			toggle_class(summary, "icon", /*clIcon*/ ctx[14]);
    			toggle_class(summary, "icon-only", /*clIcononly*/ ctx[15]);
    			toggle_class(summary, "svelte-1o5ccdl", true);
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);

    			if (dirty & /*open*/ 1) {
    				details.open = /*open*/ ctx[0];
    			}

    			if (dropdownAction_action && is_function(dropdownAction_action.update) && dirty & /*autoclose*/ 4096) dropdownAction_action.update.call(null, /*autoclose*/ ctx[12]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(details);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(card);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(87:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:0) {#if dropdown === false}
    function create_if_block$2(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let button_type_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*icon*/ ctx[9] && create_if_block_2$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);
    	let if_block1 = /*iconRight*/ ctx[10] && create_if_block_1$2(ctx);

    	let button_levels = [
    		/*$$restProps*/ ctx[17],
    		{
    			type: button_type_value = /*submit*/ ctx[13] ? "submit" : null
    		}
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "clear", /*clear*/ ctx[7]);
    			toggle_class(button, "button", 1);
    			toggle_class(button, "primary", /*primary*/ ctx[2]);
    			toggle_class(button, "secondary", /*secondary*/ ctx[3]);
    			toggle_class(button, "dark", /*dark*/ ctx[4]);
    			toggle_class(button, "error", /*error*/ ctx[5]);
    			toggle_class(button, "success", /*success*/ ctx[6]);
    			toggle_class(button, "outline", /*outline*/ ctx[1]);
    			toggle_class(button, "loading", /*loading*/ ctx[8]);
    			toggle_class(button, "icon", /*clIcon*/ ctx[14]);
    			toggle_class(button, "icon-only", /*clIcononly*/ ctx[15]);
    			toggle_class(button, "svelte-1o5ccdl", true);
    			add_location(button, file$2, 64, 0, 1789);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			append_dev(button, t1);
    			if (if_block1) if_block1.m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*events*/ ctx[16].call(null, button));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*icon*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, null, null);
    				}
    			}

    			if (/*iconRight*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(button, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17],
    				(!current || dirty & /*submit*/ 8192 && button_type_value !== (button_type_value = /*submit*/ ctx[13] ? "submit" : null)) && { type: button_type_value }
    			]));

    			toggle_class(button, "clear", /*clear*/ ctx[7]);
    			toggle_class(button, "button", 1);
    			toggle_class(button, "primary", /*primary*/ ctx[2]);
    			toggle_class(button, "secondary", /*secondary*/ ctx[3]);
    			toggle_class(button, "dark", /*dark*/ ctx[4]);
    			toggle_class(button, "error", /*error*/ ctx[5]);
    			toggle_class(button, "success", /*success*/ ctx[6]);
    			toggle_class(button, "outline", /*outline*/ ctx[1]);
    			toggle_class(button, "loading", /*loading*/ ctx[8]);
    			toggle_class(button, "icon", /*clIcon*/ ctx[14]);
    			toggle_class(button, "icon-only", /*clIcononly*/ ctx[15]);
    			toggle_class(button, "svelte-1o5ccdl", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(64:0) {#if dropdown === false}",
    		ctx
    	});

    	return block;
    }

    // (106:4) {#if icon}
    function create_if_block_4(ctx) {
    	let span;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: { src: /*icon*/ ctx[9], size: "24px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon_1.$$.fragment);
    			attr_dev(span, "class", "lefticon svelte-1o5ccdl");
    			add_location(span, file$2, 105, 15, 2712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon_1, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 512) icon_1_changes.src = /*icon*/ ctx[9];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(106:4) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (108:4) {#if iconRight}
    function create_if_block_3(ctx) {
    	let span;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: { src: /*iconRight*/ ctx[10], size: "24px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon_1.$$.fragment);
    			attr_dev(span, "class", "righticon svelte-1o5ccdl");
    			add_location(span, file$2, 107, 20, 2844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon_1, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*iconRight*/ 1024) icon_1_changes.src = /*iconRight*/ ctx[10];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(108:4) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    // (110:4) <Card style="z-index:1">
    function create_default_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1048576) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(110:4) <Card style=\\\"z-index:1\\\">",
    		ctx
    	});

    	return block;
    }

    // (83:0) {#if icon}
    function create_if_block_2$1(ctx) {
    	let span;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: { src: /*icon*/ ctx[9], size: "24px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon_1.$$.fragment);
    			attr_dev(span, "class", "lefticon svelte-1o5ccdl");
    			add_location(span, file$2, 82, 11, 2103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon_1, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 512) icon_1_changes.src = /*icon*/ ctx[9];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(83:0) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (85:0) {#if iconRight}
    function create_if_block_1$2(ctx) {
    	let span;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: { src: /*iconRight*/ ctx[10], size: "24px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon_1.$$.fragment);
    			attr_dev(span, "class", "righticon svelte-1o5ccdl");
    			add_location(span, file$2, 84, 16, 2201);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon_1, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*iconRight*/ 1024) icon_1_changes.src = /*iconRight*/ ctx[10];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(85:0) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*dropdown*/ ctx[11] === false) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dropdownAction(node, param) {
    	let autoclose = param;
    	let button = node.getElementsByTagName("summary")[0];

    	const clickOutside = () => {
    		if (!!node.open) node.open = false;
    	};

    	const clickButton = e => {
    		e.stopPropagation();
    	};

    	const clickInDD = e => {
    		e.stopPropagation();
    		if (autoclose) node.open = false;
    	};

    	node.addEventListener("click", clickInDD);
    	button.addEventListener("click", clickButton);
    	window.addEventListener("click", clickOutside);

    	return {
    		update: param => autoclose = param,
    		destroy: () => {
    			window.removeEventListener("click", clickOutside);
    			node.removeEventListener("click", clickInDD);
    			button.removeEventListener("click", clickButton);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let clIcon;
    	let clIcononly;

    	const omit_props_names = [
    		"outline","primary","secondary","dark","error","success","clear","loading","icon","iconRight","dropdown","open","autoclose","submit"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { outline = null } = $$props;
    	let { primary = null } = $$props;
    	let { secondary = null } = $$props;
    	let { dark = null } = $$props;
    	let { error = null } = $$props;
    	let { success = null } = $$props;
    	let { clear = null } = $$props;
    	let { loading = null } = $$props;
    	let { icon = null } = $$props;
    	let { iconRight = null } = $$props;
    	let { dropdown = false } = $$props;
    	let { open = false } = $$props;
    	let { autoclose = false } = $$props;
    	let { submit = false } = $$props;
    	const events = getEventsAction(current_component);
    	const hasSlot = $$props.$$slots && $$props.$$slots !== undefined;

    	function details_toggle_handler() {
    		open = this.open;
    		$$invalidate(0, open);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(22, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("outline" in $$new_props) $$invalidate(1, outline = $$new_props.outline);
    		if ("primary" in $$new_props) $$invalidate(2, primary = $$new_props.primary);
    		if ("secondary" in $$new_props) $$invalidate(3, secondary = $$new_props.secondary);
    		if ("dark" in $$new_props) $$invalidate(4, dark = $$new_props.dark);
    		if ("error" in $$new_props) $$invalidate(5, error = $$new_props.error);
    		if ("success" in $$new_props) $$invalidate(6, success = $$new_props.success);
    		if ("clear" in $$new_props) $$invalidate(7, clear = $$new_props.clear);
    		if ("loading" in $$new_props) $$invalidate(8, loading = $$new_props.loading);
    		if ("icon" in $$new_props) $$invalidate(9, icon = $$new_props.icon);
    		if ("iconRight" in $$new_props) $$invalidate(10, iconRight = $$new_props.iconRight);
    		if ("dropdown" in $$new_props) $$invalidate(11, dropdown = $$new_props.dropdown);
    		if ("open" in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ("autoclose" in $$new_props) $$invalidate(12, autoclose = $$new_props.autoclose);
    		if ("submit" in $$new_props) $$invalidate(13, submit = $$new_props.submit);
    		if ("$$scope" in $$new_props) $$invalidate(20, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		current_component,
    		Card,
    		Icon,
    		outline,
    		primary,
    		secondary,
    		dark,
    		error,
    		success,
    		clear,
    		loading,
    		icon,
    		iconRight,
    		dropdown,
    		open,
    		autoclose,
    		submit,
    		events,
    		hasSlot,
    		dropdownAction,
    		clIcon,
    		clIcononly
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(22, $$props = assign(assign({}, $$props), $$new_props));
    		if ("outline" in $$props) $$invalidate(1, outline = $$new_props.outline);
    		if ("primary" in $$props) $$invalidate(2, primary = $$new_props.primary);
    		if ("secondary" in $$props) $$invalidate(3, secondary = $$new_props.secondary);
    		if ("dark" in $$props) $$invalidate(4, dark = $$new_props.dark);
    		if ("error" in $$props) $$invalidate(5, error = $$new_props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$new_props.success);
    		if ("clear" in $$props) $$invalidate(7, clear = $$new_props.clear);
    		if ("loading" in $$props) $$invalidate(8, loading = $$new_props.loading);
    		if ("icon" in $$props) $$invalidate(9, icon = $$new_props.icon);
    		if ("iconRight" in $$props) $$invalidate(10, iconRight = $$new_props.iconRight);
    		if ("dropdown" in $$props) $$invalidate(11, dropdown = $$new_props.dropdown);
    		if ("open" in $$props) $$invalidate(0, open = $$new_props.open);
    		if ("autoclose" in $$props) $$invalidate(12, autoclose = $$new_props.autoclose);
    		if ("submit" in $$props) $$invalidate(13, submit = $$new_props.submit);
    		if ("clIcon" in $$props) $$invalidate(14, clIcon = $$new_props.clIcon);
    		if ("clIcononly" in $$props) $$invalidate(15, clIcononly = $$new_props.clIcononly);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, iconRight*/ 1536) {
    			 $$invalidate(14, clIcon = (icon !== null || iconRight !== null) && hasSlot);
    		}

    		if ($$self.$$.dirty & /*dropdown, icon*/ 2560) {
    			 $$invalidate(15, clIcononly = dropdown
    			? icon !== null && dropdown === true
    			: icon !== null && !hasSlot);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		open,
    		outline,
    		primary,
    		secondary,
    		dark,
    		error,
    		success,
    		clear,
    		loading,
    		icon,
    		iconRight,
    		dropdown,
    		autoclose,
    		submit,
    		clIcon,
    		clIcononly,
    		events,
    		$$restProps,
    		slots,
    		details_toggle_handler,
    		$$scope
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			outline: 1,
    			primary: 2,
    			secondary: 3,
    			dark: 4,
    			error: 5,
    			success: 6,
    			clear: 7,
    			loading: 8,
    			icon: 9,
    			iconRight: 10,
    			dropdown: 11,
    			open: 0,
    			autoclose: 12,
    			submit: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get primary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set primary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clear() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clear(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconRight() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconRight(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdown() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdown(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoclose() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoclose(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get submit() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set submit(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules/svelte-chota/cmp/Input.svelte generated by Svelte v3.32.1 */
    const file$3 = "node_modules/svelte-chota/cmp/Input.svelte";

    // (61:0) {:else}
    function create_else_block$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;
    	let input_levels = [{ type: /*type*/ ctx[1] }, /*$$restProps*/ ctx[6], { value: /*value*/ ctx[0] }];
    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			toggle_class(input, "error", /*error*/ ctx[2]);
    			toggle_class(input, "success", /*success*/ ctx[3]);
    			toggle_class(input, "svelte-ovucoa", true);
    			add_location(input, file$3, 61, 1, 1342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.value = input_data.value;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*events*/ ctx[4].call(null, input)),
    					listen_dev(input, "input", /*onInput*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty & /*type*/ 2 && { type: /*type*/ ctx[1] },
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6],
    				dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0] && { value: /*value*/ ctx[0] }
    			]));

    			if ("value" in input_data) {
    				input.value = input_data.value;
    			}

    			toggle_class(input, "error", /*error*/ ctx[2]);
    			toggle_class(input, "success", /*success*/ ctx[3]);
    			toggle_class(input, "svelte-ovucoa", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(61:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (53:0) {#if type === 'textarea'}
    function create_if_block$3(ctx) {
    	let textarea_1;
    	let mounted;
    	let dispose;
    	let textarea_1_levels = [/*$$restProps*/ ctx[6], { value: /*value*/ ctx[0] }];
    	let textarea_1_data = {};

    	for (let i = 0; i < textarea_1_levels.length; i += 1) {
    		textarea_1_data = assign(textarea_1_data, textarea_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			set_attributes(textarea_1, textarea_1_data);
    			toggle_class(textarea_1, "error", /*error*/ ctx[2]);
    			toggle_class(textarea_1, "success", /*success*/ ctx[3]);
    			add_location(textarea_1, file$3, 53, 1, 1217);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*events*/ ctx[4].call(null, textarea_1)),
    					listen_dev(textarea_1, "input", /*onInput*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea_1, textarea_1_data = get_spread_update(textarea_1_levels, [
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6],
    				dirty & /*value*/ 1 && { value: /*value*/ ctx[0] }
    			]));

    			toggle_class(textarea_1, "error", /*error*/ ctx[2]);
    			toggle_class(textarea_1, "success", /*success*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(53:0) {#if type === 'textarea'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] === "textarea") return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"value","type","error","success","password","number","textarea","color","date","range"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	let { value = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { error = null } = $$props;
    	let { success = null } = $$props;
    	let { password = false } = $$props;
    	let { number = false } = $$props;
    	let { textarea = false } = $$props;
    	let { color = false } = $$props;
    	let { date = false } = $$props;
    	let { range = false } = $$props;
    	const events = getEventsAction(current_component);

    	const onInput = e => {
    		const type = e.target.type;
    		const val = e.target.value;
    		if (type === "number" || type === "range") $$invalidate(0, value = val === "" ? undefined : +val); else $$invalidate(0, value = val);
    	};

    	let getState = getContext("field:state");
    	let state_unsubscribe = false;

    	if (getState) {
    		state_unsubscribe = getState.subscribe(state => {
    			if (state === "error") $$invalidate(2, error = true); else if (state === "success") $$invalidate(3, success = true); else $$invalidate(3, success = $$invalidate(2, error = false));
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("type" in $$new_props) $$invalidate(1, type = $$new_props.type);
    		if ("error" in $$new_props) $$invalidate(2, error = $$new_props.error);
    		if ("success" in $$new_props) $$invalidate(3, success = $$new_props.success);
    		if ("password" in $$new_props) $$invalidate(7, password = $$new_props.password);
    		if ("number" in $$new_props) $$invalidate(8, number = $$new_props.number);
    		if ("textarea" in $$new_props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("color" in $$new_props) $$invalidate(10, color = $$new_props.color);
    		if ("date" in $$new_props) $$invalidate(11, date = $$new_props.date);
    		if ("range" in $$new_props) $$invalidate(12, range = $$new_props.range);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		getContext,
    		current_component,
    		value,
    		type,
    		error,
    		success,
    		password,
    		number,
    		textarea,
    		color,
    		date,
    		range,
    		events,
    		onInput,
    		getState,
    		state_unsubscribe
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("type" in $$props) $$invalidate(1, type = $$new_props.type);
    		if ("error" in $$props) $$invalidate(2, error = $$new_props.error);
    		if ("success" in $$props) $$invalidate(3, success = $$new_props.success);
    		if ("password" in $$props) $$invalidate(7, password = $$new_props.password);
    		if ("number" in $$props) $$invalidate(8, number = $$new_props.number);
    		if ("textarea" in $$props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("color" in $$props) $$invalidate(10, color = $$new_props.color);
    		if ("date" in $$props) $$invalidate(11, date = $$new_props.date);
    		if ("range" in $$props) $$invalidate(12, range = $$new_props.range);
    		if ("getState" in $$props) getState = $$new_props.getState;
    		if ("state_unsubscribe" in $$props) state_unsubscribe = $$new_props.state_unsubscribe;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*password*/ 128) {
    			 if (password) $$invalidate(1, type = "password");
    		}

    		if ($$self.$$.dirty & /*number*/ 256) {
    			 if (number) $$invalidate(1, type = "number");
    		}

    		if ($$self.$$.dirty & /*textarea*/ 512) {
    			 if (textarea) $$invalidate(1, type = "textarea");
    		}

    		if ($$self.$$.dirty & /*color*/ 1024) {
    			 if (color) $$invalidate(1, type = "color");
    		}

    		if ($$self.$$.dirty & /*date*/ 2048) {
    			 if (date) $$invalidate(1, type = "date");
    		}

    		if ($$self.$$.dirty & /*range*/ 4096) {
    			 if (range) $$invalidate(1, type = "range");
    		}
    	};

    	return [
    		value,
    		type,
    		error,
    		success,
    		events,
    		onInput,
    		$$restProps,
    		password,
    		number,
    		textarea,
    		color,
    		date,
    		range
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			value: 0,
    			type: 1,
    			error: 2,
    			success: 3,
    			password: 7,
    			number: 8,
    			textarea: 9,
    			color: 10,
    			date: 11,
    			range: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get password() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set password(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get number() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get range() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set range(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules/svelte-chota/cmp/Modal.svelte generated by Svelte v3.32.1 */
    const file$4 = "node_modules/svelte-chota/cmp/Modal.svelte";

    // (15:0) {#if open}
    function create_if_block$4(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let div1_levels = [/*$$restProps*/ ctx[2]];
    	let div1_data = {};

    	for (let i = 0; i < div1_levels.length; i += 1) {
    		div1_data = assign(div1_data, div1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "background svelte-4lwi8h");
    			add_location(div0, file$4, 16, 4, 485);
    			set_attributes(div1, div1_data);
    			toggle_class(div1, "modal", 1);
    			toggle_class(div1, "svelte-4lwi8h", true);
    			add_location(div1, file$4, 17, 4, 542);
    			attr_dev(div2, "class", "container svelte-4lwi8h");
    			add_location(div2, file$4, 15, 0, 421);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false),
    					action_destroyer(/*events*/ ctx[1].call(null, div1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(div1, div1_data = get_spread_update(div1_levels, [dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]]));
    			toggle_class(div1, "modal", 1);
    			toggle_class(div1, "svelte-4lwi8h", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 200 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 200 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(15:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = ["open"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { open = false } = $$props;
    	const events = getEventsAction(current_component);
    	let is_header = $$props.$$slots && $$props.$$slots.header !== undefined;
    	let is_footer = $$props.$$slots && $$props.$$slots.footer !== undefined;
    	const click_handler = e => $$invalidate(0, open = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("open" in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getEventsAction,
    		fade,
    		current_component,
    		open,
    		events,
    		is_header,
    		is_footer
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("open" in $$props) $$invalidate(0, open = $$new_props.open);
    		if ("is_header" in $$props) is_header = $$new_props.is_header;
    		if ("is_footer" in $$props) is_footer = $$new_props.is_footer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [open, events, $$restProps, $$scope, slots, click_handler];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { open: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get open() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/GetSch.svelte generated by Svelte v3.32.1 */

    const { console: console_1 } = globals;
    const file$5 = "src/GetSch.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (86:1) <Button on:click={click}>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Load new schematic");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(86:1) <Button on:click={click}>",
    		ctx
    	});

    	return block;
    }

    // (91:2) {#if files.length>0}
    function create_if_block_1$3(ctx) {
    	let each_1_anchor;
    	let each_value_1 = Array.from(/*files*/ ctx[1].keys());
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Array, files*/ 2) {
    				each_value_1 = Array.from(/*files*/ ctx[1].keys());
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(91:2) {#if files.length>0}",
    		ctx
    	});

    	return block;
    }

    // (92:2) {#each Array.from(files.keys()) as id}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*files*/ ctx[1][/*id*/ ctx[17]].name + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*id*/ ctx[17];
    			option.value = option.__value;
    			add_location(option, file$5, 92, 2, 2609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*files*/ 2 && t0_value !== (t0_value = /*files*/ ctx[1][/*id*/ ctx[17]].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*files*/ 2 && option_value_value !== (option_value_value = /*id*/ ctx[17])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(92:2) {#each Array.from(files.keys()) as id}",
    		ctx
    	});

    	return block;
    }

    // (103:2) <h4 slot="header">
    function create_header_slot(ctx) {
    	let h4;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Select Root schematic";
    			attr_dev(h4, "slot", "header");
    			add_location(h4, file$5, 102, 2, 2743);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(103:2) <h4 slot=\\\"header\\\">",
    		ctx
    	});

    	return block;
    }

    // (106:3) {#if files.length>0}
    function create_if_block$5(ctx) {
    	let each_1_anchor;
    	let each_value = Array.from(/*files*/ ctx[1].keys());
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Array, files*/ 2) {
    				each_value = Array.from(/*files*/ ctx[1].keys());
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(106:3) {#if files.length>0}",
    		ctx
    	});

    	return block;
    }

    // (107:3) {#each Array.from(files.keys()) as id}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*files*/ ctx[1][/*id*/ ctx[17]].name + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*id*/ ctx[17];
    			option.value = option.__value;
    			add_location(option, file$5, 107, 3, 2986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*files*/ 2 && t0_value !== (t0_value = /*files*/ ctx[1][/*id*/ ctx[17]].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*files*/ 2 && option_value_value !== (option_value_value = /*id*/ ctx[17])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(107:3) {#each Array.from(files.keys()) as id}",
    		ctx
    	});

    	return block;
    }

    // (115:3) <Button primary on:click={modal_hide}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Done");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(115:3) <Button primary on:click={modal_hide}>",
    		ctx
    	});

    	return block;
    }

    // (114:2) <div slot="footer" class="is-right">
    function create_footer_slot(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				primary: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*modal_hide*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "footer");
    			attr_dev(div, "class", "is-right");
    			add_location(div, file$5, 113, 2, 3076);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(114:2) <div slot=\\\"footer\\\" class=\\\"is-right\\\">",
    		ctx
    	});

    	return block;
    }

    // (102:1) <Card>
    function create_default_slot_1(ctx) {
    	let t0;
    	let select;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*files*/ ctx[1].length > 0 && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			select = element("select");
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(select, "id", "sch_select");
    			attr_dev(select, "size", "5");
    			set_style(select, "width", "200px");
    			if (/*sch_idx*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[9].call(select));
    			add_location(select, file$5, 104, 2, 2791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, select, anchor);
    			if (if_block) if_block.m(select, null);
    			select_option(select, /*sch_idx*/ ctx[0]);
    			insert_dev(target, t1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler_1*/ ctx[9]),
    					listen_dev(select, "change", /*handleSelect*/ ctx[6], false, false, false),
    					listen_dev(select, "blur", handleSelectBlur, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*files*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(select, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*sch_idx, Array, files*/ 3) {
    				select_option(select, /*sch_idx*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(select);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(102:1) <Card>",
    		ctx
    	});

    	return block;
    }

    // (101:0) <Modal bind:open={modal_open}>
    function create_default_slot$1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: {
    					default: [create_default_slot_1],
    					footer: [create_footer_slot],
    					header: [create_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty & /*$$scope, sch_idx, files*/ 4194307) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(101:0) <Modal bind:open={modal_open}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let p;
    	let input;
    	let t0;
    	let button;
    	let t1;
    	let select;
    	let t2;
    	let br;
    	let t3;
    	let modal;
    	let updating_open;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click);
    	let if_block = /*files*/ ctx[1].length > 0 && create_if_block_1$3(ctx);

    	function modal_open_binding(value) {
    		/*modal_open_binding*/ ctx[10].call(null, value);
    	}

    	let modal_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*modal_open*/ ctx[2] !== void 0) {
    		modal_props.open = /*modal_open*/ ctx[2];
    	}

    	modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "open", modal_open_binding));

    	const block = {
    		c: function create() {
    			p = element("p");
    			input = element("input");
    			t0 = space();
    			create_component(button.$$.fragment);
    			t1 = space();
    			select = element("select");
    			if (if_block) if_block.c();
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			create_component(modal.$$.fragment);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "id", "fileInput");
    			attr_dev(input, "accept", ".sch");
    			input.multiple = true;
    			set_style(input, "display", "none");
    			add_location(input, file$5, 83, 1, 2215);
    			attr_dev(select, "id", "sch_select");
    			attr_dev(select, "size", "1");
    			set_style(select, "width", "200px");
    			if (/*sch_idx*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
    			add_location(select, file$5, 89, 1, 2417);
    			attr_dev(p, "class", "grouped");
    			add_location(p, file$5, 82, 0, 2194);
    			add_location(br, file$5, 99, 0, 2697);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, input);
    			append_dev(p, t0);
    			mount_component(button, p, null);
    			append_dev(p, t1);
    			append_dev(p, select);
    			if (if_block) if_block.m(select, null);
    			select_option(select, /*sch_idx*/ ctx[0]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(modal, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[7]),
    					listen_dev(input, "blur", blur, false, false, false),
    					listen_dev(input, "change", /*change*/ ctx[5], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[8]),
    					listen_dev(select, "change", /*handleSelect*/ ctx[6], false, false, false),
    					listen_dev(select, "blur", handleSelectBlur, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*files*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					if_block.m(select, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*sch_idx, Array, files*/ 3) {
    				select_option(select, /*sch_idx*/ ctx[0]);
    			}

    			const modal_changes = {};

    			if (dirty & /*$$scope, sch_idx, files*/ 4194307) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty & /*modal_open*/ 4) {
    				updating_open = true;
    				modal_changes.open = /*modal_open*/ ctx[2];
    				add_flush_callback(() => updating_open = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			destroy_component(button);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t3);
    			destroy_component(modal, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function click() {
    	let input = document.getElementById("fileInput");
    	input.click();
    }

    function blur() {
    	console.log("blur");
    }

    function handleSelectBlur(event) {
    	console.log("handle file blur");
    } //dispatch('selected',{})

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GetSch", slots, []);
    	let modal_open = false;
    	let modal_data;
    	const modal_show = event => $$invalidate(2, modal_open = true);
    	const modal_hide = event => $$invalidate(2, modal_open = false);
    	const dispatch = createEventDispatcher();
    	let { sch_idx = -1 } = $$props;
    	let { files = [] } = $$props;
    	let fileList = [];

    	function handleFilesSelect(e) {
    		const { acceptedFiles, fileRejections } = e.detail;
    		$$invalidate(1, files.accepted = acceptedFiles.filter(elt => elt.name.endsWith(".sch")), files);
    	} // console.log(e)
    	// files.accepted = [...files.accepted, ...acceptedFiles];

    	//files.rejected = [...files.rejected, ...fileRejections];
    	function readFiles(files) {
    		if (files.length > 0) {
    			clear_sch();
    		}

    		// console.log(files.accepted)
    		for (const file of files) {
    			console.log(file.name);
    			var reader = new FileReader();

    			// await reader.readAsArrayBuffer(file);
    			reader.readAsText(file);

    			reader.onload = function (event) {
    				// console.log('reader.onload');
    				file.raw = event.target.result;
    			}; // console.log(event.target.result.length);
    			// console.log(event.target.result.byteLength);
    			// console.log(reader.result.byteLength);
    			// console.log(reader.result.toString());

    			reader.onerror = function () {
    				console.log(reader.error);
    			};
    		}
    	} //console.log(reader)
    	// console.log(files)

    	function clear_sch() {
    		document.getElementById("sch_select").selectedIndex = -1;
    		$$invalidate(0, sch_idx = -1);
    	}

    	function change() {
    		if (fileList.length > 0) {
    			console.log("change");
    			$$invalidate(0, sch_idx = -1);
    			$$invalidate(1, files = Array.from(fileList));
    			readFiles(files);
    			dispatch("loaded", {});
    			$$invalidate(2, modal_open = true);
    		}

    		console.log("change", files, files.keys());
    	}

    	function handleSelect(event) {
    		console.log("handle file select");
    		dispatch("selected", {});
    	}

    	const writable_props = ["sch_idx", "files"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<GetSch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		fileList = this.files;
    		$$invalidate(3, fileList);
    	}

    	function select_change_handler() {
    		sch_idx = select_value(this);
    		$$invalidate(0, sch_idx);
    		$$invalidate(1, files);
    	}

    	function select_change_handler_1() {
    		sch_idx = select_value(this);
    		$$invalidate(0, sch_idx);
    		$$invalidate(1, files);
    	}

    	function modal_open_binding(value) {
    		modal_open = value;
    		$$invalidate(2, modal_open);
    	}

    	$$self.$$set = $$props => {
    		if ("sch_idx" in $$props) $$invalidate(0, sch_idx = $$props.sch_idx);
    		if ("files" in $$props) $$invalidate(1, files = $$props.files);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Modal,
    		Button,
    		Card,
    		modal_open,
    		modal_data,
    		modal_show,
    		modal_hide,
    		dispatch,
    		sch_idx,
    		files,
    		fileList,
    		handleFilesSelect,
    		readFiles,
    		clear_sch,
    		click,
    		blur,
    		change,
    		handleSelect,
    		handleSelectBlur
    	});

    	$$self.$inject_state = $$props => {
    		if ("modal_open" in $$props) $$invalidate(2, modal_open = $$props.modal_open);
    		if ("modal_data" in $$props) modal_data = $$props.modal_data;
    		if ("sch_idx" in $$props) $$invalidate(0, sch_idx = $$props.sch_idx);
    		if ("files" in $$props) $$invalidate(1, files = $$props.files);
    		if ("fileList" in $$props) $$invalidate(3, fileList = $$props.fileList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		sch_idx,
    		files,
    		modal_open,
    		fileList,
    		modal_hide,
    		change,
    		handleSelect,
    		input_change_handler,
    		select_change_handler,
    		select_change_handler_1,
    		modal_open_binding
    	];
    }

    class GetSch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { sch_idx: 0, files: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GetSch",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get sch_idx() {
    		throw new Error("<GetSch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sch_idx(value) {
    		throw new Error("<GetSch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get files() {
    		throw new Error("<GetSch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<GetSch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var test_parts = {
    	"Resistor_SMD:R_0603_1608Metric_Pad1.05x0.95mm_HandSolder": {
    	"249": {
    		designator: [
    			"R12",
    			"R18",
    			"R24",
    			"R30"
    		],
    		MPN: "TC0325B2490T5E",
    		LCSC: "C124686"
    	},
    	"10k": {
    		designator: [
    			"R7",
    			"R13",
    			"R19",
    			"R25"
    		],
    		MPN: "RC0603FR-0710KL",
    		LCSC: ""
    	},
    	"100k": {
    		designator: [
    			"R8",
    			"R14",
    			"R20",
    			"R26",
    			"R9",
    			"R15",
    			"R21",
    			"R27"
    		],
    		MPN: "RC0603FR-07100KL",
    		LCSC: ""
    	},
    	"4.42K": {
    		designator: [
    			"R11",
    			"R17",
    			"R23",
    			"R29"
    		],
    		MPN: "0603WAF4421T5E",
    		LCSC: "C23043"
    	},
    	"10K": {
    		designator: [
    			"R10",
    			"R16",
    			"R22",
    			"R28"
    		],
    		MPN: "0603WAF1002T5E",
    		LCSC: "C25804"
    	}
    },
    	"Inductor_SMD:L_0805_2012Metric_Pad1.15x1.40mm_HandSolder": {
    	"MMZ2012Y152B ": {
    		designator: [
    			"L1",
    			"L2",
    			"L3",
    			"L4"
    		],
    		MPN: "MMZ2012Y152B",
    		LCSC: ""
    	}
    },
    	"AD8237ARMZ:SOP65P490X110-8N": {
    	AD8237ARMZ: {
    		designator: [
    			"IC3",
    			"IC6",
    			"IC9",
    			"IC12"
    		],
    		MPN: "AD8237ARMZ",
    		LCSC: ""
    	}
    },
    	"Capacitor_SMD:C_0603_1608Metric_Pad1.05x0.95mm_HandSolder": {
    	"100nF": {
    		designator: [
    			"C8",
    			"C18",
    			"C28",
    			"C38",
    			"C7",
    			"C17",
    			"C27",
    			"C37",
    			"C10",
    			"C20",
    			"C30",
    			"C40",
    			"C4",
    			"C14",
    			"C24",
    			"C34"
    		],
    		MPN: "",
    		LCSC: ""
    	},
    	"1uF": {
    		designator: [
    			"C9",
    			"C19",
    			"C29",
    			"C39"
    		],
    		MPN: "CL10A105KB8NNNC",
    		LCSC: ""
    	},
    	"10uF": {
    		designator: [
    			"C3",
    			"C13",
    			"C23",
    			"C33"
    		],
    		MPN: "CL10A106KP8NNNC",
    		LCSC: "C19702"
    	}
    },
    	"Capacitor_Tantalum_SMD:CP_EIA-3216-18_Kemet-A_Pad1.58x1.35mm_HandSolder": {
    	"10uF": {
    		designator: [
    			"C11",
    			"C21",
    			"C31",
    			"C41"
    		],
    		MPN: "TAJA106K016RNJ",
    		LCSC: ""
    	}
    },
    	"Capacitor_SMD:C_0402_1005Metric": {
    	"100nF": {
    		designator: [
    			"C5",
    			"C15",
    			"C25",
    			"C35",
    			"C6",
    			"C16",
    			"C26",
    			"C36"
    		],
    		MPN: "CL05B104KO5NNNC",
    		LCSC: "C1525"
    	},
    	"1uF": {
    		designator: [
    			"C2",
    			"C12",
    			"C22",
    			"C32"
    		],
    		MPN: "CL05A105KA5NQNC",
    		LCSC: "C52923"
    	}
    },
    	"Package_TO_SOT_SMD:TSOT-23-5": {
    	"AD8603AUJZ-R2": {
    		designator: [
    			"IC2",
    			"IC5",
    			"IC8",
    			"IC11"
    		],
    		MPN: "AD8603AUJZ-R2",
    		LCSC: ""
    	}
    },
    	"Package_TO_SOT_SMD:SOT-23-6_Handsoldering": {
    	REF3425IDBVR: {
    		designator: [
    			"IC1",
    			"IC4",
    			"IC7",
    			"IC10"
    		],
    		MPN: "",
    		LCSC: ""
    	}
    },
    	"Package_SO:MSOP-8_3x3mm_P0.65mm": {
    	AD8236: {
    		designator: [
    			"U2",
    			"U3",
    			"U4",
    			"U5"
    		],
    		MPN: "",
    		LCSC: ""
    	}
    }
    };

    const grouped_data = writable({});

    /* src/Editor.svelte generated by Svelte v3.32.1 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$6 = "src/Editor.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (142:2) {#each Array.from(footprints.keys()) as id}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t0_value = /*footprints*/ ctx[0][/*id*/ ctx[22]] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*id*/ ctx[22];
    			option.value = option.__value;
    			add_location(option, file$6, 142, 2, 4222);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*footprints*/ 1 && t0_value !== (t0_value = /*footprints*/ ctx[0][/*id*/ ctx[22]] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*footprints*/ 1 && option_value_value !== (option_value_value = /*id*/ ctx[22])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(142:2) {#each Array.from(footprints.keys()) as id}",
    		ctx
    	});

    	return block;
    }

    // (153:2) {#each Array.from(values.keys()) as id}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*values*/ ctx[3][/*id*/ ctx[22]] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*id*/ ctx[22];
    			option.value = option.__value;
    			add_location(option, file$6, 153, 2, 4525);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values*/ 8 && t0_value !== (t0_value = /*values*/ ctx[3][/*id*/ ctx[22]] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*values*/ 8 && option_value_value !== (option_value_value = /*id*/ ctx[22])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(153:2) {#each Array.from(values.keys()) as id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div0;
    	let label0;
    	let t1;
    	let select0;
    	let t2;
    	let br;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let select1;
    	let t6;
    	let div2;
    	let p0;
    	let label2;
    	let t8;
    	let input0;
    	let input0_value_value;
    	let t9;
    	let p1;
    	let label3;
    	let t11;
    	let input1;
    	let input1_value_value;
    	let t12;
    	let p2;
    	let label4;
    	let t14;
    	let input2;
    	let input2_value_value;
    	let t15;
    	let p3;
    	let label5;
    	let t17;
    	let input3;
    	let input3_value_value;
    	let t18;
    	let p4;
    	let label6;
    	let t20;
    	let input4;
    	let input4_value_value;
    	let t21;
    	let button0;
    	let t23;
    	let button1;
    	let t25;
    	let button2;
    	let t27;
    	let button3;
    	let mounted;
    	let dispose;
    	let each_value_1 = Array.from(/*footprints*/ ctx[0].keys());
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = Array.from(/*values*/ ctx[3].keys());
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Footprint";
    			t1 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			br = element("br");
    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Components";
    			t5 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div2 = element("div");
    			p0 = element("p");
    			label2 = element("label");
    			label2.textContent = "References";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			p1 = element("p");
    			label3 = element("label");
    			label3.textContent = "Footprint";
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			p2 = element("p");
    			label4 = element("label");
    			label4.textContent = "Value";
    			t14 = space();
    			input2 = element("input");
    			t15 = space();
    			p3 = element("p");
    			label5 = element("label");
    			label5.textContent = "LCSC";
    			t17 = space();
    			input3 = element("input");
    			t18 = space();
    			p4 = element("p");
    			label6 = element("label");
    			label6.textContent = "MPN";
    			t20 = space();
    			input4 = element("input");
    			t21 = space();
    			button0 = element("button");
    			button0.textContent = "Look at JSON";
    			t23 = text("    \n");
    			button1 = element("button");
    			button1.textContent = "Look up part";
    			t25 = text("    \n");
    			button2 = element("button");
    			button2.textContent = "Download updated json";
    			t27 = space();
    			button3 = element("button");
    			button3.textContent = "Save all parts to database / csv";
    			attr_dev(label0, "for", "footprint_select");
    			attr_dev(label0, "class", "fields svelte-kaygfv");
    			add_location(label0, file$6, 139, 1, 4023);
    			attr_dev(select0, "id", "footprint_select");
    			attr_dev(select0, "size", "5");
    			set_style(select0, "width", "500px");
    			if (/*footprint_idx*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[14].call(select0));
    			add_location(select0, file$6, 140, 1, 4088);
    			add_location(br, file$6, 147, 1, 4298);
    			attr_dev(div0, "class", "centered-select svelte-kaygfv");
    			add_location(div0, file$6, 137, 0, 3991);
    			attr_dev(label1, "for", "value_select");
    			attr_dev(label1, "class", "fields svelte-kaygfv");
    			add_location(label1, file$6, 150, 1, 4341);
    			attr_dev(select1, "id", "value_select");
    			attr_dev(select1, "size", "5");
    			set_style(select1, "width", "500px");
    			if (/*value_idx*/ ctx[2] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[15].call(select1));
    			add_location(select1, file$6, 151, 1, 4403);
    			attr_dev(div1, "class", "centered-select svelte-kaygfv");
    			add_location(div1, file$6, 149, 0, 4310);
    			attr_dev(label2, "class", "fields svelte-kaygfv");
    			attr_dev(label2, "for", "refs");
    			add_location(label2, file$6, 161, 2, 4660);
    			attr_dev(input0, "id", "refs");
    			attr_dev(input0, "type", "text");
    			input0.value = input0_value_value = /*fields*/ ctx[4].refs;
    			input0.readOnly = "readonly";
    			set_style(input0, "background", "lightgrey");
    			add_location(input0, file$6, 162, 2, 4716);
    			attr_dev(p0, "class", "grouped");
    			add_location(p0, file$6, 160, 1, 4637);
    			attr_dev(label3, "class", "fields svelte-kaygfv");
    			attr_dev(label3, "for", "Footprint");
    			add_location(label3, file$6, 165, 2, 4846);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "fields-input");
    			attr_dev(input1, "id", "Footprint");

    			input1.value = input1_value_value = /*footprints*/ ctx[0][/*footprint_idx*/ ctx[1]]
    			? /*footprints*/ ctx[0][/*footprint_idx*/ ctx[1]]
    			: "";

    			add_location(input1, file$6, 166, 2, 4905);
    			attr_dev(p1, "class", "grouped");
    			add_location(p1, file$6, 164, 1, 4824);
    			attr_dev(label4, "class", "fields svelte-kaygfv");
    			attr_dev(label4, "for", "Value");
    			add_location(label4, file$6, 170, 2, 5099);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "Value");

    			input2.value = input2_value_value = /*values*/ ctx[3][/*value_idx*/ ctx[2]]
    			? /*values*/ ctx[3][/*value_idx*/ ctx[2]]
    			: "";

    			add_location(input2, file$6, 171, 2, 5150);
    			attr_dev(p2, "class", "grouped");
    			add_location(p2, file$6, 169, 1, 5077);
    			attr_dev(label5, "class", "fields svelte-kaygfv");
    			attr_dev(label5, "for", "LCSC");
    			add_location(label5, file$6, 175, 2, 5302);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "LCSC");
    			input3.value = input3_value_value = /*fields*/ ctx[4].LCSC;
    			add_location(input3, file$6, 176, 2, 5351);
    			attr_dev(p3, "class", "grouped");
    			add_location(p3, file$6, 174, 1, 5280);
    			attr_dev(label6, "class", "fields svelte-kaygfv");
    			attr_dev(label6, "for", "MPN");
    			add_location(label6, file$6, 179, 2, 5452);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "id", "MPN");
    			input4.value = input4_value_value = /*fields*/ ctx[4].MPN;
    			add_location(input4, file$6, 180, 2, 5498);
    			attr_dev(p4, "class", "grouped");
    			add_location(p4, file$6, 178, 1, 5430);
    			set_style(div2, "line-height", "200%");
    			add_location(div2, file$6, 159, 0, 4603);
    			add_location(button0, file$6, 183, 0, 5579);
    			add_location(button1, file$6, 186, 0, 5648);
    			add_location(button2, file$6, 189, 0, 5720);
    			add_location(button3, file$6, 192, 0, 5782);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*footprint_idx*/ ctx[1]);
    			append_dev(div0, t2);
    			append_dev(div0, br);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label1);
    			append_dev(div1, t5);
    			append_dev(div1, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*value_idx*/ ctx[2]);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p0);
    			append_dev(p0, label2);
    			append_dev(p0, t8);
    			append_dev(p0, input0);
    			append_dev(div2, t9);
    			append_dev(div2, p1);
    			append_dev(p1, label3);
    			append_dev(p1, t11);
    			append_dev(p1, input1);
    			append_dev(div2, t12);
    			append_dev(div2, p2);
    			append_dev(p2, label4);
    			append_dev(p2, t14);
    			append_dev(p2, input2);
    			append_dev(div2, t15);
    			append_dev(div2, p3);
    			append_dev(p3, label5);
    			append_dev(p3, t17);
    			append_dev(p3, input3);
    			append_dev(div2, t18);
    			append_dev(div2, p4);
    			append_dev(p4, label6);
    			append_dev(p4, t20);
    			append_dev(p4, input4);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, button3, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[14]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[15]),
    					listen_dev(input1, "blur", /*set*/ ctx[7], false, false, false),
    					listen_dev(input1, "change", /*change*/ ctx[8], false, false, false),
    					listen_dev(input2, "blur", /*set*/ ctx[7], false, false, false),
    					listen_dev(input2, "change", /*change*/ ctx[8], false, false, false),
    					listen_dev(input3, "change", /*set_lcsc*/ ctx[5], false, false, false),
    					listen_dev(input4, "change", /*set_mpn*/ ctx[6], false, false, false),
    					listen_dev(button0, "click", /*log_json*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", lookup_part, false, false, false),
    					listen_dev(button2, "click", /*download*/ ctx[11], false, false, false),
    					listen_dev(button3, "click", /*parts_to_database*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array, footprints*/ 1) {
    				each_value_1 = Array.from(/*footprints*/ ctx[0].keys());
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*footprint_idx, Array, footprints*/ 3) {
    				select_option(select0, /*footprint_idx*/ ctx[1]);
    			}

    			if (dirty & /*Array, values*/ 8) {
    				each_value = Array.from(/*values*/ ctx[3].keys());
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*value_idx, Array, values*/ 12) {
    				select_option(select1, /*value_idx*/ ctx[2]);
    			}

    			if (dirty & /*fields*/ 16 && input0_value_value !== (input0_value_value = /*fields*/ ctx[4].refs) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*footprints, footprint_idx, Array*/ 3 && input1_value_value !== (input1_value_value = /*footprints*/ ctx[0][/*footprint_idx*/ ctx[1]]
    			? /*footprints*/ ctx[0][/*footprint_idx*/ ctx[1]]
    			: "") && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*values, value_idx, Array*/ 12 && input2_value_value !== (input2_value_value = /*values*/ ctx[3][/*value_idx*/ ctx[2]]
    			? /*values*/ ctx[3][/*value_idx*/ ctx[2]]
    			: "") && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty & /*fields*/ 16 && input3_value_value !== (input3_value_value = /*fields*/ ctx[4].LCSC) && input3.value !== input3_value_value) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (dirty & /*fields*/ 16 && input4_value_value !== (input4_value_value = /*fields*/ ctx[4].MPN) && input4.value !== input4_value_value) {
    				prop_dev(input4, "value", input4_value_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(button3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function lookup_part() {
    	alert("not implemented yet");
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Editor", slots, []);
    	let parts_dict = test_parts;
    	console.log("Editor, parts_dict", parts_dict);
    	let footprints = Object.keys(parts_dict);
    	let changed = [];

    	// let dialog = this.fetch('dialog')
    	// let dialog = 'not clicked yet'
    	let footprint_idx = -1;

    	let old_footprint_idx = -1;
    	let value_idx;
    	let values = [];
    	let refs = "";
    	let fields = { LCSC: "", MPN: "", refs: "" };
    	let renameProp = (oldProp, newProp, { [oldProp]: old, ...others }) => ({ [newProp]: old, ...others });

    	const unsubscribe = grouped_data.subscribe(value => {
    		$$invalidate(12, parts_dict = value);

    		//console.log("data changed, parts_dict", parts_dict)
    		$$invalidate(0, footprints = Object.keys(parts_dict).filter(elt => elt != "filename"));

    		//reset();
    		$$invalidate(1, footprint_idx = -1);

    		$$invalidate(3, values = []);
    		$$invalidate(2, value_idx = -1);
    	});

    	onDestroy(unsubscribe);

    	function reset() {
    		clear_value();
    		$$invalidate(1, footprint_idx = -1);
    	}

    	function clear_value() {
    		document.getElementById("value_select").selectedIndex = -1;
    		$$invalidate(2, value_idx = -1);
    	}

    	function set_lcsc(event) {
    		const newvalue = event.srcElement.value;
    		console.log("blur lcsc", newvalue);
    		$$invalidate(12, parts_dict[footprints[footprint_idx]][values[value_idx]].LCSC = newvalue, parts_dict);
    	}

    	function set_mpn(event) {
    		const newvalue = event.srcElement.value;
    		console.log("blur lcsc", newvalue);
    		$$invalidate(12, parts_dict[footprints[footprint_idx]][values[value_idx]].MPN = newvalue, parts_dict);
    		console.log("blur mpn");
    	}

    	function set(event) {
    		console.log("set", event);

    		if (event.srcElement.id == "Footprint") {
    			console.log(footprints[footprint_idx]);
    		}

    		if (event.srcElement.id == "Value") {
    			console.log(values[value_idx]);
    		}
    	}

    	function change(event) {
    		console.log("change", event);
    		let newkey = event.srcElement.value;

    		if (event.srcElement.id == "Footprint") {
    			console.log(footprints[footprint_idx], newkey);
    			$$invalidate(12, parts_dict = renameProp(footprints[footprint_idx], newkey, parts_dict));
    			console.log("old keys", footprints);
    			$$invalidate(0, footprints = Object.keys(parts_dict).filter(elt => elt != "filename"));
    			console.log("new keys", footprints);
    		}

    		if (event.srcElement.id == "Value") {
    			console.log(values[value_idx]);
    		}
    	}

    	function log_json() {
    		console.log(JSON.stringify(parts_dict, null, 2));
    	}

    	function parts_to_database() {
    		//alert('not implemented yet')
    		let lines = [];

    		for (let footprint in parts_dict) {
    			for (let value in parts_dict[footprint]) {
    				let line = [
    					footprint,
    					value,
    					parts_dict[footprint][value].LCSC,
    					parts_dict[footprint][value].MPN
    				];

    				lines.push("\"" + line.join("\",\"") + "\"\n");
    			}
    		}

    		const blob = new Blob(lines, { type: "text/csv" });
    		downloadBlob(blob, "database.csv");
    	}

    	function download() {
    		const blob = new Blob([JSON.stringify(parts_dict, null, 2)], { type: "application/json" });
    		downloadBlob(blob, "tweaked.json");
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		footprint_idx = select_value(this);
    		$$invalidate(1, footprint_idx);
    		$$invalidate(0, footprints);
    	}

    	function select1_change_handler() {
    		value_idx = select_value(this);
    		$$invalidate(2, value_idx);
    		(((($$invalidate(3, values), $$invalidate(1, footprint_idx)), $$invalidate(13, old_footprint_idx)), $$invalidate(12, parts_dict)), $$invalidate(0, footprints));
    	}

    	$$self.$capture_state = () => ({
    		test_parts,
    		onDestroy,
    		grouped_data,
    		Input,
    		parts_dict,
    		footprints,
    		changed,
    		footprint_idx,
    		old_footprint_idx,
    		value_idx,
    		values,
    		refs,
    		fields,
    		renameProp,
    		unsubscribe,
    		reset,
    		clear_value,
    		set_lcsc,
    		set_mpn,
    		set,
    		change,
    		log_json,
    		lookup_part,
    		parts_to_database,
    		download
    	});

    	$$self.$inject_state = $$props => {
    		if ("parts_dict" in $$props) $$invalidate(12, parts_dict = $$props.parts_dict);
    		if ("footprints" in $$props) $$invalidate(0, footprints = $$props.footprints);
    		if ("changed" in $$props) changed = $$props.changed;
    		if ("footprint_idx" in $$props) $$invalidate(1, footprint_idx = $$props.footprint_idx);
    		if ("old_footprint_idx" in $$props) $$invalidate(13, old_footprint_idx = $$props.old_footprint_idx);
    		if ("value_idx" in $$props) $$invalidate(2, value_idx = $$props.value_idx);
    		if ("values" in $$props) $$invalidate(3, values = $$props.values);
    		if ("refs" in $$props) refs = $$props.refs;
    		if ("fields" in $$props) $$invalidate(4, fields = $$props.fields);
    		if ("renameProp" in $$props) renameProp = $$props.renameProp;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*footprint_idx, old_footprint_idx, parts_dict, footprints*/ 12291) {
    			 {
    				console.log("footprint_idx chnage?", footprint_idx);

    				if (footprint_idx >= 0) {
    					if (old_footprint_idx != footprint_idx) {
    						// console.log('old, new', old_footprint_idx, footprint_idx)
    						$$invalidate(3, values = Object.keys(parts_dict[footprints[footprint_idx]]));

    						// console.log(values)
    						// ref_idx = -1;
    						clear_value();
    					}

    					$$invalidate(13, old_footprint_idx = footprint_idx);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*value_idx, parts_dict, footprints, footprint_idx, values*/ 4111) {
    			 {
    				// console.log('value_idx', value_idx)
    				console.log("value_idx changed?");

    				if (value_idx > -1) {
    					//console.log(parts_dict[footprints[footprint_idx]][values[value_idx]])
    					$$invalidate(4, fields.LCSC = parts_dict[footprints[footprint_idx]][values[value_idx]].LCSC, fields);

    					$$invalidate(4, fields.MPN = parts_dict[footprints[footprint_idx]][values[value_idx]].MPN, fields);
    					$$invalidate(4, fields.refs = parts_dict[footprints[footprint_idx]][values[value_idx]].designator, fields);
    				} else {
    					$$invalidate(4, fields.LCSC = "", fields);
    					$$invalidate(4, fields.MPN = "", fields);
    					$$invalidate(4, fields.refs = "", fields);
    				}
    			}
    		}
    	};

    	return [
    		footprints,
    		footprint_idx,
    		value_idx,
    		values,
    		fields,
    		set_lcsc,
    		set_mpn,
    		set,
    		change,
    		log_json,
    		parts_to_database,
    		download,
    		parts_dict,
    		old_footprint_idx,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function load_sheet(raw) {
    	console.log('parse_sheet');
    	let contents = [];

    	let parse_block = 0;
    	let block = {};
    	let item_index = 0;
    	function process_line(line) {
    		// console.log(line)
    		var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
    		// console.log(pieces)

    		if (parse_block==0) {
    			// console.log(pieces[0])
    			switch(pieces[0]) {
    				case 'EESchema':
    				case 'Connection':
    				case 'NoConn':
    				case '$EndSCHEMATC':
    					parse_block = 0;
    					break;
    				case 'LIBS':  // not sure how to process this
    					console.log('got ', pieces[0]);
    					break;
    				case 'EELAYER':
    				case 'Text':
    				case 'Wire':
    				case 'Entry':
    					parse_block = 1;
    					break;
    				case '$Descr':
    				case '$Sheet':
    				case '$Comp':
    				case '$Bitmap':
    					parse_block = 2;
    					break;
    				default:
    					console.log('not recognized', pieces[0]);
    					parse_block = -1;
    			}
    			if (parse_block >= 0) {  // handle recognized parts
    				// console.log(pieces[0])
    				block = {'type':pieces[0], 'lines': [line], 'idx': item_index};
    				if (parse_block == 0) contents.push(block);
    				item_index += 1;
    			} else parse_block = 0; // done handling not recognized
    		} else if (parse_block ==1 ) {
    			// append line to block
    			block['lines'].push(line);
    			parse_block = 0;
    			contents.push(block);
    		} else {
    			block['lines'].push(line);
    			// check if this is the last line of the block
    			if (/^\$End/.test(line)) {
    				parse_block = 0;
    				contents.push(block);
    			}
    		}
    	}
    	for (let line of raw.split(/\r?\n/)) {
    		// console.log(line.length, line)
    		if (line.length>0) process_line(line);
    	}
    	console.log('done');
    	return contents
    }
    function process_sheet_content(contents, sheets_to_update) {
    	// let grouped = {}
    	console.log('mark components');
    	// mark items which are components
    	for (let item of contents) {
    		if (item['type']=='$Comp') {
    			for (let line of item['lines']) {
    				if (/^F 0/.test(line)) {
    					var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
    					if (!pieces[2].startsWith('"#')) {
    						// console.log(item['idx'], line)
    						item['component'] = true;
    					}
    				}
    			}
    		}
    		if (item['type']=='$Sheet') {
    			console.log('found sheet');
    			// need to consolidate these
    			for (let line of item['lines']) {
    				// console.log(line)
    				if (/^F0/.test(line)) {
    					var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
    					console.log('sheet ID', pieces[1]);
    				} else if (/^F1/.test(line)) {
    					var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
    					const name = pieces[1].match(/"(.*?)"/)[1];
    					console.log('sheet filename', pieces[1]);
    					const index = sheets_to_update.indexOf(name);
    					if (index==-1) sheets_to_update.push(name);
    				}
    			}
    		}
    	}
    }


    let required_fields = ['MPN', 'LCSC'];
    function add_field(name, lines) {
    	let num_f = 0;
    	let newline;
    	for (let line of lines) {
    		let pieces = line.split(' ');
    		if (pieces[0]=='F') num_f++;
    		if (pieces[1]=='3') newline = line;
    	}
    	// fix newline which is a copy of field #3 as a template
    	let pieces = newline.match(/(?:[^\s"]+|"[^"]*")+/g);
    	pieces[1] = num_f;
    	pieces[2] = '""';
    	newline = pieces.join(' ');
    	newline += ' "'+name+'"';
    	// console.log('add_field, num_f', num_f)
    	const index = lines.findIndex(elt => elt.startsWith("F "+(num_f-1)));
    	// console.log('index', index, lines[index])
    	lines.splice(index+1, 0, newline);
    	// console.log('add_field', lines)
    	return lines
    }
    function add_to_group(contents, grouped) {
    	for (let item of contents) {
    		if (item['component']) {
    			let value, footprint;
    			let fields_to_add = [...required_fields];
    			let extra_fields = {};
    			fields_to_add.forEach(elt => extra_fields[elt] = '');
    			let references = [];
    			for (let line of item['lines']) {
    				var pieces = line.match(/(?:[^\s"]+|"[^"]*")+/g);
    				if (pieces[0]=='F') ;
    				if (/^AR/.test(line)) {
    					const ref = pieces[2].match(/"(.*?)"/)[1];
    					if (!ref.endsWith('?')) {
    						const index = references.indexOf(ref);
    						if (index==-1) references.push(ref);
    					}
    				}
    				if (/^F 0 /.test(line)) {
    					const ref = pieces[2].match(/"(.*?)"/)[1];
    					if (!ref.endsWith('?')) {
    						const index = references.indexOf(ref);
    						if (index==-1) references.push(ref);
    					}
    				}
    				if (/^F 1 /.test(line)) {
    					value = pieces[2].match(/"(.*?)"/)[1];
    					// console.log(value)
    				}
    				if (/^F 2 /.test(line)) {
    					footprint = pieces[2].match(/"(.*?)"/)[1];
    				}
    				if (pieces.length==11) {
    					let field = pieces[10].match(/"(.*?)"/)[1];
    					if (field in extra_fields) {
    						// console.log("has", field)
    						extra_fields[field] = pieces[2].match(/"(.*?)"/)[1];
    						const index = fields_to_add.indexOf(field);
    						if (index>-1) fields_to_add.splice(index, 1);  // remove from list to add
    						// console.log('extra_fields left', fields_to_add)
    					}
    				}
    			}
    			// console.log('fields to add', fields_to_add);
    			fields_to_add.forEach( elt => {
    				item.lines = add_field(elt, item.lines);
    			});

    			if (grouped[footprint]) { // footprint is already there
    				if(grouped[footprint][value]) { // value is already there
    					grouped[footprint][value]['designator'].push(...references);
    				} else { // value is not yet there
    					grouped[footprint][value]={'designator':references};
    					grouped[footprint][value] = {...grouped[footprint][value], ...extra_fields};
    					// grouped[footprint][value].lcsc = extra_fields.lcsc
    					// grouped[footprint][value].mpn = extra_fields.mpn
    				}
    			} else {  // footprint is not yet there
    				grouped[footprint] = {};
    				grouped[footprint][value] = {'designator': references};
    				grouped[footprint][value] = {...grouped[footprint][value], ...extra_fields};
    				// grouped[footprint][value].lcsc = extra_fields.lcsc
    				// grouped[footprint][value].mpn = extra_fields.mpn
    			}
    			// console.log(designator, value, footprint)
    			// console.log(item)
    		}
    	}
    }
    function get_all_sheets(files, start_idx) {
    	console.log('get_all_sheets, files',files);
    	let grouped = {};
    	let content = load_sheet(files[start_idx].raw);
    	// console.log('content', content);
    	files[start_idx].content = content;
    	let sheets_to_process = [];
    	process_sheet_content(content, sheets_to_process);
    	add_to_group(content, grouped);
    	console.log('sheets_to_update', sheets_to_process);
    	while (sheets_to_process.length>0) {
    		// const new_name = path.dirname(filename)+path.sep+sheets_to_update.pop()
    		const new_name = sheets_to_process.pop();
    		console.log('path', new_name);
    		let file = files.filter(elt => elt.name==new_name)[0];
    		content = load_sheet(file.raw);
    		file.content = content;
    		process_sheet_content(content, sheets_to_process);
    		add_to_group(content, grouped);
    		// content = load_sheet(new_name);
    		// process_sheet_content(content, sheets_to_update);
    		// console.log('sheets_to_update', sheets_to_update)
    	}
    	// console.log(grouped)
    	return grouped
    }

    /* src/App.svelte generated by Svelte v3.32.1 */

    const { console: console_1$2 } = globals;
    const file$7 = "src/App.svelte";

    // (39:0) {#if sch_idx>=0}
    function create_if_block$6(ctx) {
    	let editor;
    	let current;
    	editor = new Editor({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(editor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(editor, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(editor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(39:0) {#if sch_idx>=0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let h2;
    	let t1;
    	let getsch;
    	let updating_files;
    	let updating_sch_idx;
    	let t2;
    	let if_block_anchor;
    	let current;

    	function getsch_files_binding(value) {
    		/*getsch_files_binding*/ ctx[3].call(null, value);
    	}

    	function getsch_sch_idx_binding(value) {
    		/*getsch_sch_idx_binding*/ ctx[4].call(null, value);
    	}

    	let getsch_props = {};

    	if (/*files*/ ctx[1] !== void 0) {
    		getsch_props.files = /*files*/ ctx[1];
    	}

    	if (/*sch_idx*/ ctx[0] !== void 0) {
    		getsch_props.sch_idx = /*sch_idx*/ ctx[0];
    	}

    	getsch = new GetSch({ props: getsch_props, $$inline: true });
    	binding_callbacks.push(() => bind(getsch, "files", getsch_files_binding));
    	binding_callbacks.push(() => bind(getsch, "sch_idx", getsch_sch_idx_binding));
    	getsch.$on("selected", /*handleSelected*/ ctx[2]);
    	let if_block = /*sch_idx*/ ctx[0] >= 0 && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Kicad schematic parts tweaker";
    			t1 = space();
    			create_component(getsch.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h2, file$7, 36, 0, 898);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(getsch, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const getsch_changes = {};

    			if (!updating_files && dirty & /*files*/ 2) {
    				updating_files = true;
    				getsch_changes.files = /*files*/ ctx[1];
    				add_flush_callback(() => updating_files = false);
    			}

    			if (!updating_sch_idx && dirty & /*sch_idx*/ 1) {
    				updating_sch_idx = true;
    				getsch_changes.sch_idx = /*sch_idx*/ ctx[0];
    				add_flush_callback(() => updating_sch_idx = false);
    			}

    			getsch.$set(getsch_changes);

    			if (/*sch_idx*/ ctx[0] >= 0) {
    				if (if_block) {
    					if (dirty & /*sch_idx*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(getsch.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(getsch.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			destroy_component(getsch, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleLoaded(event) {
    	console.log("handleLoaded", event);
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let sch_idx = -1;
    	let files = [];
    	let content;
    	let grouped = {};
    	let loaded = false;

    	/*
    $: { if (sch_idx>=0 &&  !loaded) {
    	grouped = get_all_sheets(files, sch_idx)
    	loaded = true;
    	// console.log(grouped)
    	//console.log('content', files.accepted[sch_idx].content)
    }}
    */
    	function handleSelected(event) {
    		console.log("file selected", event);
    		console.log("sch_idx", sch_idx, "files", files);
    		grouped = get_all_sheets(files, sch_idx);
    		console.log("handleSelected, grouped ", grouped);
    		grouped_data.set(grouped);
    		loaded = true;
    	}

    	function status() {
    		console.log("updated files, grouped", files, grouped);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function getsch_files_binding(value) {
    		files = value;
    		$$invalidate(1, files);
    	}

    	function getsch_sch_idx_binding(value) {
    		sch_idx = value;
    		$$invalidate(0, sch_idx);
    	}

    	$$self.$capture_state = () => ({
    		GetSch,
    		Editor,
    		get_all_sheets,
    		grouped_data,
    		sch_idx,
    		files,
    		content,
    		grouped,
    		loaded,
    		handleLoaded,
    		handleSelected,
    		status
    	});

    	$$self.$inject_state = $$props => {
    		if ("sch_idx" in $$props) $$invalidate(0, sch_idx = $$props.sch_idx);
    		if ("files" in $$props) $$invalidate(1, files = $$props.files);
    		if ("content" in $$props) content = $$props.content;
    		if ("grouped" in $$props) grouped = $$props.grouped;
    		if ("loaded" in $$props) loaded = $$props.loaded;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 {
    		status();
    	}

    	return [sch_idx, files, handleSelected, getsch_files_binding, getsch_sch_idx_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

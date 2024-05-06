export const run_all = (fns) => {
    for (const fn of fns)
        fn();
};
export const add = (target, event, fn, options = {}) => {
    target.addEventListener(event, fn, options);
    return () => {
        target.removeEventListener(event, fn, options);
    };
};
export const intersect = (node, { enter, leave, options = {} }) => {
    if (typeof IntersectionObserver !== "undefined") {
        const observer = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting) {
                enter();
            }
            else {
                leave();
            }
        }, options);
        observer.observe(node);
        return { destroy: () => observer.disconnect() };
    }
    else {
        let prev;
        const fn = () => {
            const bcr = node.getBoundingClientRect();
            const is = (bcr.bottom > 0 &&
                bcr.right > 0 &&
                bcr.top < window.innerHeight &&
                bcr.left < window.innerWidth);
            if (prev !== is) {
                prev = is;
                if (is) {
                    enter();
                }
                else {
                    leave();
                }
            }
        };
        fn();
        const remove = [
            add(window, "scroll", fn, { passive: true, capture: true }),
            add(window, "resize", fn)
        ];
        return {
            destroy() {
                run_all(remove);
            }
        };
    }
};
export const click_out = (node, handler) => {
    return {
        destroy: add(node.ownerDocument || document, "click", (event) => {
            let target = event.target;
            while (target != null) {
                if (target === node)
                    return;
                target = target.parentElement;
            }
            handler(event);
        }, { capture: true })
    };
};
export const portal = (node) => {
    document.body.appendChild(node);
    return {
        destroy() {
            node.parentElement?.removeChild(node);
        }
    };
};
export const intelliHide = (node) => {
    let lastScroll = null;
    let state = "fix";
    const fix = (y) => {
        state = "fix";
        node.style.transition = "none";
        node.style.transform = `translateY(-${y}px)`;
    };
    const show = () => {
        if (state === "show")
            return;
        state = "show";
        node.style.transition = "transform 400ms ease";
        node.style.transform = "translateY(0)";
        node.dispatchEvent(new CustomEvent("intellihide-show"));
    };
    const hide = () => {
        if (state === "hide")
            return;
        state = "hide";
        node.style.transition = "transform 400ms ease";
        node.style.transform = "translateY(-100%)";
        node.dispatchEvent(new CustomEvent("intellihide-hide"));
    };
    const onScroll = () => {
        const y = document.scrollingElement?.scrollTop ?? 0;
        if (lastScroll != null) {
            if (y === 0) {
                fix(y);
            }
            else if (y > lastScroll) {
                if (node.clientHeight > y) {
                    fix(y);
                }
                else {
                    hide();
                }
            }
            else if (y < lastScroll) {
                show();
            }
        }
        lastScroll = y;
    };
    onScroll();
    return {
        destroy: add(window, "scroll", onScroll)
    };
};

import { useEffect } from "react";

const DASH_CLASS = "bold-dash";

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "CODE",
  "PRE",
  "SVG",
  "PATH",
]);

function shouldSkip(node: Node): boolean {
  let el: Node | null = node.parentNode;
  while (el && el instanceof Element) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.classList.contains(DASH_CLASS)) return true;
    if ((el as HTMLElement).dataset && (el as HTMLElement).dataset.noDash === "true")
      return true;
    el = el.parentNode;
  }
  return false;
}

const DASH_RE = /(?<=\S)\s(-)\s(?=\S)|(?<=\S)(-)(?=\S)/g;

function processTextNode(textNode: Text) {
  const text = textNode.nodeValue || "";
  if (!text.includes("-")) return;
  if (shouldSkip(textNode)) return;

  const re = new RegExp(DASH_RE.source, "g");
  let hasMatch = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    hasMatch = true;
    break;
  }
  if (!hasMatch) return;

  const frag = document.createDocumentFragment();
  let last = 0;
  const re2 = new RegExp(DASH_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re2.exec(text)) !== null) {
    const dashChar = match[1] ?? match[2];
    const dashIndex = match.index + match[0].indexOf(dashChar);

    if (dashIndex > last) {
      frag.appendChild(document.createTextNode(text.slice(last, dashIndex)));
    }
    const span = document.createElement("span");
    span.className = DASH_CLASS;
    span.textContent = "-";
    frag.appendChild(span);
    last = dashIndex + 1;
  }
  if (last < text.length) {
    frag.appendChild(document.createTextNode(text.slice(last)));
  }
  textNode.parentNode?.replaceChild(frag, textNode);
}

function walk(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    nodes.push(n as Text);
  }
  nodes.forEach(processTextNode);
}

export function useBoldDashes() {
  useEffect(() => {
    let scheduled = false;
    const run = () => {
      scheduled = false;
      observer.disconnect();
      walk(document.body);
      observer.observe(document.body, { childList: true, subtree: true });
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(run);
    };

    const observer = new MutationObserver(schedule);

    schedule();

    return () => observer.disconnect();
  }, []);
}

export default useBoldDashes;

export const loadScriptTags = (scripts: string[]) => {
  // Are there any scripts to load?
  if (!scripts || !scripts.length) return;

  // If this wallpaper doesn't have a <head> the rest won't work.
  const head = document.querySelector('head');
  if (!head) return;

  // Loop through scripts
  for (const script of scripts) {
    const mySandbox = document.createElement('div');
    mySandbox.innerHTML = script;

    // Manual 'clone' because actual cloneNode didn't seem to work.
    const scriptEl = mySandbox.querySelector('script');
    if (!scriptEl || !scriptEl.attributes) continue;

    // Create a new script element
    const newScript = document.createElement('script');
    for (let j = scriptEl.attributes.length; j--; ) {
      newScript.setAttribute(
        scriptEl.attributes[j].name,
        scriptEl.attributes[j].value
      );
    }

    // Copy inline content as well
    newScript.innerHTML = scriptEl.innerHTML;

    // Append the new "cloned" script element
    head.appendChild(newScript);
  }
};

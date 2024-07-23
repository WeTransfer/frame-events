/**
 * Loads and appends script tags to the document head.
 *
 * @param scripts - An array of script strings to be added to the document head.
 */
export const loadScriptTags = (scripts: string[]) => {
  // Ensure scripts array is valid and has elements to load
  if (!scripts || scripts.length === 0) return;

  // Get the <head> element of the document
  const head = document.querySelector('head');
  if (!head) return;

  // Loop through scripts
  scripts.forEach((script) => {
    // Create a sandbox to parse the script string into an element
    const sandbox = document.createElement('div');
    sandbox.innerHTML = script;

    // Extract the script element from the sandbox
    const scriptElement = sandbox.querySelector('script');
    if (!scriptElement || !scriptElement.attributes) return;

    // Create a new script element
    const newScript = document.createElement('script');

    // Copy all attributes from the original script element
    Array.from(scriptElement.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    // Copy the inline content of the script
    newScript.textContent = scriptElement.textContent;

    // Append the new script element to the document head
    head.appendChild(newScript);
  });
};

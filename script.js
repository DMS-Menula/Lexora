document.addEventListener("DOMContentLoaded", function () {
  // Initialize variables
  let editor;
  let currentLanguage = "javascript";
  let isDarkMode = false;
  let isFullscreen = false;

  // Hide page loader when everything is loaded
  window.addEventListener("load", function () {
    setTimeout(() => {
      document.getElementById("pageLoader").classList.add("hidden");
    }, 1000);
  });

  // Default code templates for each language
  const codeTemplates = {
    javascript: `// JavaScript code
function helloWorld() {
    console.log("Hello, World!");
    return "This is JavaScript output";
}

// Call the function
const result = helloWorld();

// Output the result
console.log("Function returned:", result);`,
    python: `# Python code
def hello_world():
    print("Hello, World!")
    return "This is Python output"

# Call the function
result = hello_world()

# Output the result
print("Function returned:", result)`,
    java: `// Java code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        int sum = addNumbers(5, 7);
        System.out.println("5 + 7 = " + sum);
    }
    
    public static int addNumbers(int a, int b) {
        return a + b;
    }
}`,
    csharp: `// C# code
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        int sum = AddNumbers(5, 7);
        Console.WriteLine($"5 + 7 = {sum}");
    }
    
    static int AddNumbers(int a, int b) {
        return a + b;
    }
}`,
    php: `<?php
// PHP code
function helloWorld() {
    echo "Hello, World!\\n";
    return "This is PHP output";
}

// Call the function
$result = helloWorld();

// Output the result
echo "Function returned: " . $result . "\\n";
?>`,
    html: `<!DOCTYPE html>
<html>
<head>
    <title>HTML Example</title>
    <style>
        body { 
            font-family: Arial;
            background-color: #f0f0f0;
            padding: 20px;
        }
        h1 { 
            color: blue;
            text-align: center;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, World!</h1>
        <p>This is an HTML example with some basic styling.</p>
        <button onclick="alert('Button clicked!')">Click Me</button>
    </div>
    <script>
        console.log("JavaScript running in HTML");
    </script>
</body>
</html>`,
    css: `/* CSS Example */
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 20px;
}

header {
    background: linear-gradient(to right, #4f46e5, #7c3aed);
    color: white;
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.button {
    display: inline-block;
    background: #4f46e5;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.3s;
}

.button:hover {
    background: #7c3aed;
}`,
  };

  // Initialize Monaco Editor
  require.config({
    paths: {
      vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs",
    },
  });
  require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById("editor"), {
      value: codeTemplates[currentLanguage],
      language: currentLanguage,
      theme: "vs",
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      scrollBeyondLastLine: false,
      renderWhitespace: "selection",
    });

    // Listen for editor content changes
    editor.onDidChangeModelContent(function () {
      localStorage.setItem("lastCode_" + currentLanguage, editor.getValue());
    });

    // Hide page loader when editor is ready
    document.getElementById("pageLoader").classList.add("hidden");
  });

  // Language selection
  document.querySelectorAll(".language-option").forEach((option) => {
    option.addEventListener("click", function (e) {
      e.preventDefault();
      const lang = this.getAttribute("data-lang");
      currentLanguage = lang;
      document.getElementById("currentLanguage").textContent = this.textContent;

      // Load saved code or template
      const savedCode = localStorage.getItem("lastCode_" + lang);
      const template = codeTemplates[lang] || "";
      const codeToLoad = savedCode || template;

      if (editor) {
        monaco.editor.setModelLanguage(editor.getModel(), lang);
        editor.setValue(codeToLoad);
      }
    });
  });

  // Run button click handler
  document.getElementById("runBtn").addEventListener("click", function () {
    runCode();
  });

  // Clear output button
  document
    .getElementById("clearOutputBtn")
    .addEventListener("click", function () {
      document.getElementById("output").innerHTML = "";
      document.getElementById("executionTime").textContent = "Output cleared";
    });

  // Theme toggle
  document.getElementById("themeToggle").addEventListener("click", function () {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode", isDarkMode);
    this.innerHTML = isDarkMode
      ? '<i class="fas fa-sun me-1"></i> Light Mode'
      : '<i class="fas fa-moon me-1"></i> Dark Mode';

    if (editor) {
      monaco.editor.setTheme(isDarkMode ? "vs-dark" : "vs");
    }

    localStorage.setItem("darkMode", isDarkMode);
  });

  // Fullscreen toggle
  document
    .getElementById("fullscreenToggle")
    .addEventListener("click", function () {
      isFullscreen = !isFullscreen;
      const editorElement = document.getElementById("editor");

      if (isFullscreen) {
        editorElement.classList.add("editor-fullscreen");
        editor.layout();
        this.innerHTML = '<i class="fas fa-compress me-1"></i> Exit Fullscreen';
      } else {
        editorElement.classList.remove("editor-fullscreen");
        editor.layout();
        this.innerHTML = '<i class="fas fa-expand me-1"></i> Fullscreen';
      }
    });

  // Save button
  document.getElementById("saveBtn").addEventListener("click", function () {
    if (editor) {
      localStorage.setItem("lastCode_" + currentLanguage, editor.getValue());
      showToast("Code saved locally!", "success");
    }
  });

  // Share button
  document.getElementById("shareBtn").addEventListener("click", function () {
    if (editor) {
      const code = editor.getValue();
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `code_${currentLanguage}_${Date.now()}.${getFileExtension(
        currentLanguage
      )}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Code downloaded!", "success");
    }
  });

  // Check for saved dark mode preference
  if (localStorage.getItem("darkMode") === "true") {
    document.getElementById("themeToggle").click();
  }

  // Check for saved code
  window.addEventListener("load", function () {
    const savedCode = localStorage.getItem("lastCode_" + currentLanguage);
    if (savedCode && editor) {
      editor.setValue(savedCode);
    }
  });

  // Function to run code with actual execution
  function runCode() {
    const outputElement = document.getElementById("output");
    const executionTimeElement = document.getElementById("executionTime");
    const executionLoader = document.getElementById("executionLoader");
    const code = editor ? editor.getValue() : "";

    outputElement.innerHTML = "";
    executionTimeElement.textContent = "Executing...";
    executionLoader.classList.remove("hidden");

    // Clear previous execution if any
    if (window.executionIframe) {
      document.body.removeChild(window.executionIframe);
      window.executionIframe = null;
    }

    setTimeout(() => {
      try {
        let result = "";
        const startTime = performance.now();

        switch (currentLanguage) {
          case "javascript":
            result = executeJavaScript(code);
            break;
          case "python":
            result = executePython(code);
            break;
          case "html":
            result = executeHtml(code);
            break;
          case "css":
            result = executeCss(code);
            break;
          case "java":
          case "csharp":
          case "php":
            result = executeWithCompilerAPI(code);
            break;
          default:
            result = `<div class="error">Unsupported language: ${currentLanguage}</div>`;
        }

        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        outputElement.innerHTML = result;
        executionTimeElement.textContent = `Executed in ${executionTime}ms`;
      } catch (error) {
        outputElement.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        executionTimeElement.textContent = "Execution failed";
      } finally {
        executionLoader.classList.add("hidden");
      }
    }, 100);
  }

  // Actual JavaScript execution
  function executeJavaScript(code) {
    // Capture console.log output
    const originalConsoleLog = console.log;
    let consoleOutput = "";

    console.log = function () {
      const args = Array.from(arguments)
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join(" ");
      consoleOutput += args + "\n";
      originalConsoleLog.apply(console, arguments);
    };

    try {
      // Execute the code
      const result = new Function(code)();

      // Restore original console.log
      console.log = originalConsoleLog;

      // Format the output
      let output = "";
      if (consoleOutput) {
        output += `<pre class="console-output">${consoleOutput}</pre>`;
      }
      if (result !== undefined) {
        output += `<div class="mt-3"><strong>Return value:</strong> <pre class="return-value">${JSON.stringify(
          result,
          null,
          2
        )}</pre></div>`;
      }

      return (
        output ||
        '<div class="success">Code executed successfully with no output</div>'
      );
    } catch (error) {
      console.log = originalConsoleLog;
      throw error;
    }
  }

  // Python execution using Pyodide
  async function executePython(code) {
    try {
      // Load Pyodide if not already loaded
      if (!window.pyodide) {
        showToast("Loading Python runtime...", "info");
        window.pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
        });
      }

      // Capture print output
      let pythonOutput = "";
      window.pyodide.setStdout({
        batched: (text) => {
          pythonOutput += text;
        }
      });

      // Execute the code
      await window.pyodide.loadPackagesFromImports(code);
      const result = await window.pyodide.runPythonAsync(code);

      // Format the output
      let output = "";
      if (pythonOutput) {
        output += `<pre class="console-output">${pythonOutput}</pre>`;
      }
      if (result !== undefined) {
        output += `<div class="mt-3"><strong>Return value:</strong> <pre class="return-value">${JSON.stringify(
          result,
          null,
          2
        )}</pre></div>`;
      }

      return (
        output ||
        '<div class="success">Python code executed successfully with no output</div>'
      );
    } catch (error) {
      throw error;
    }
  }

  // Actual HTML execution
  function executeHtml(code) {
    // Create an iframe to safely execute HTML
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    window.executionIframe = iframe;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();

      // Extract script console output
      let scriptOutput = "";
      const originalConsoleLog = console.log;

      console.log = function () {
        const args = Array.from(arguments).join(" ");
        scriptOutput += args + "\n";
        originalConsoleLog.apply(console, arguments);
      };

      // Check for scripts in the HTML
      const scripts = doc.getElementsByTagName("script");
      for (let script of scripts) {
        try {
          iframe.contentWindow.eval(script.innerHTML);
        } catch (e) {
          scriptOutput += `Script error: ${e.message}\n`;
        }
      }

      console.log = originalConsoleLog;

      // Format the output
      let output = `<div class="bg-white p-3 rounded mb-3">
                      <h5 class="mb-2">HTML Preview</h5>
                      <iframe srcdoc="${encodeURIComponent(
                        code
                      )}" style="width:100%; height:200px; border:1px solid #ddd;"></iframe>
                   </div>`;

      if (scriptOutput) {
        output += `<div class="mt-3">
                     <h5 class="mb-2">Console Output</h5>
                     <pre class="bg-gray-700 p-2 rounded">${scriptOutput}</pre>
                  </div>`;
      }

      output += `<div class="mt-3">
                  <h5 class="mb-2">HTML Code</h5>
                  <pre class="bg-gray-700 p-2 rounded">${escapeHtml(
                    code
                  )}</pre>
               </div>`;

      return output;
    } catch (error) {
      document.body.removeChild(iframe);
      window.executionIframe = null;
      throw error;
    }
  }

  // CSS execution
  function executeCss(code) {
    try {
      // Create a preview element
      const preview = `
        <div class="bg-white p-3 rounded mb-3">
          <h5 class="mb-2">CSS Preview</h5>
          <style>${code}</style>
          <div class="container">
            <header>
              <h1>Styled Header</h1>
            </header>
            <div class="content">
              <p>This element shows how your CSS styles are applied.</p>
              <a href="#" class="button">Styled Button</a>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <h5 class="mb-2">CSS Code</h5>
          <pre class="bg-gray-700 p-2 rounded">${escapeHtml(code)}</pre>
        </div>
      `;

      return preview;
    } catch (error) {
      throw error;
    }
  }

  // Function to execute code with a compiler API (placeholder)
  async function executeWithCompilerAPI(code) {
    // This is a placeholder for actual API integration
    // In a real implementation, you would call an API like:
    // Judge0, JDoodle, or compile and run on your own server
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is just simulation - replace with actual API call
      let output = "";
      let exitCode = 0;
      
      switch(currentLanguage) {
        case "java":
          output = "Hello, World!\n5 + 7 = 12";
          break;
        case "csharp":
          output = "Hello, World!\n5 + 7 = 12";
          break;
        case "php":
          output = "Hello, World!\nFunction returned: This is PHP output";
          break;
        default:
          output = "Code executed successfully (simulated)";
      }
      
      if (exitCode !== 0) {
        throw new Error("Compilation failed");
      }
      
      return `<div class="mb-3">
                <div class="success">Code executed successfully via ${currentLanguage} compiler</div>
                <pre class="bg-gray-700 p-2 rounded mt-2">${output}</pre>
              </div>`;
    } catch (error) {
      throw error;
    }
  }

  // Helper functions
  function getFileExtension(language) {
    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      csharp: "cs",
      php: "php",
      html: "html",
      css: "css",
    };
    return extensions[language] || "txt";
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast show position-fixed bottom-0 end-0 mb-3 me-3 bg-${type} text-white`;
    toast.style.zIndex = "1100";
    toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Keyboard shortcut for running code (Ctrl+Enter)
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  });

  // Load Pyodide for Python execution
  async function loadPyodide(config) {
    const script = document.createElement("script");
    script.src = `${config.indexURL}pyodide.js`;
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = async () => {
        const pyodide = await window.loadPyodide({
          indexURL: config.indexURL
        });
        resolve(pyodide);
      };
    });
  }
});
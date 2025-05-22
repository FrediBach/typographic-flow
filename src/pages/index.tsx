import React, { useState, useEffect, useRef, useMemo } from "react";
import { markdownToHtml } from "@/util/markdown";
import Head from "next/head";
import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the typography settings interface
interface TypographySettings {
  baseFontSize: number;
  baseLineHeight: number;
  scaleRatio: number;
  paragraphSpacing: number;
  headingSpacing: number;
  listSpacing: number;
  rampAlgorithm: string;
  minFontSize: number;
  maxFontSize: number;
  customRampValues: number[];
  responsiveScaling: boolean;
  mobileScaleFactor: number;
  tabletScaleFactor: number;
  breakpointMobile: number;
  breakpointTablet: number;
  fontFamily: string;
  headingFontFamily: string;
  useSeparateHeadingFont: boolean;
  baseFontWeight: number;
  fontWeightRampAlgorithm: string;
  minFontWeight: number;
  maxFontWeight: number;
  customWeightRampValues: number[];
  useWeightRamp: boolean;
}

// Define a font option interface
interface FontOption {
  family: string;
  category: string;
  variants: string[];
}

// Define viewport sizes for preview
type ViewportSize = 'mobile' | 'tablet' | 'desktop';

// Define visualization modes
type VisualizationMode = 'none' | 'spacing';

// Define ramp algorithms
type RampAlgorithm = {
  name: string;
  description: string;
  calculateSizes: (settings: TypographySettings) => number[];
};

// Define font weight ramp algorithms
type WeightRampAlgorithm = {
  name: string;
  description: string;
  calculateWeights: (settings: TypographySettings) => number[];
};

export default function Home() {
  // Font weight ramp algorithms
  const weightRampAlgorithms: Record<string, WeightRampAlgorithm> = {
    stepped: {
      name: "Stepped Weights",
      description: "Uses predefined weight steps for each heading level",
      calculateWeights: (settings) => {
        return settings.useWeightRamp ? settings.customWeightRampValues : [700, 700, 600, 600, 500, 400];
      },
    },
    linear: {
      name: "Linear Weight Scale",
      description: "Equal steps between min and max font weights",
      calculateWeights: (settings) => {
        if (!settings.useWeightRamp) return [700, 700, 600, 600, 500, 400];
        
        const { minFontWeight, maxFontWeight } = settings;
        const step = (maxFontWeight - minFontWeight) / 5;
        return [
          Math.round(maxFontWeight),
          Math.round(maxFontWeight - step),
          Math.round(maxFontWeight - 2 * step),
          Math.round(maxFontWeight - 3 * step),
          Math.round(maxFontWeight - 4 * step),
          Math.round(minFontWeight),
        ];
      },
    },
    custom: {
      name: "Custom Weight Ramp",
      description: "Define your own custom weight values for each heading level",
      calculateWeights: (settings) => {
        return settings.useWeightRamp ? settings.customWeightRampValues : [700, 700, 600, 600, 500, 400];
      },
    },
  };

  // Ramp algorithms
  const rampAlgorithms: Record<string, RampAlgorithm> = {
    modular: {
      name: "Modular Scale",
      description: "Uses a consistent ratio between each step in the scale",
      calculateSizes: (settings) => {
        return [
          Math.round(settings.baseFontSize * Math.pow(settings.scaleRatio, 4)),
          Math.round(settings.baseFontSize * Math.pow(settings.scaleRatio, 3)),
          Math.round(settings.baseFontSize * Math.pow(settings.scaleRatio, 2)),
          Math.round(settings.baseFontSize * Math.pow(settings.scaleRatio, 1)),
          Math.round(settings.baseFontSize),
          Math.round(settings.baseFontSize * 0.9),
        ];
      },
    },
    linear: {
      name: "Linear Scale",
      description: "Equal steps between each size in the scale",
      calculateSizes: (settings) => {
        const { minFontSize, maxFontSize } = settings;
        const step = (maxFontSize - minFontSize) / 5;
        return [
          Math.round(maxFontSize),
          Math.round(maxFontSize - step),
          Math.round(maxFontSize - 2 * step),
          Math.round(maxFontSize - 3 * step),
          Math.round(maxFontSize - 4 * step),
          Math.round(minFontSize),
        ];
      },
    },
    fibonacci: {
      name: "Fibonacci Sequence",
      description: "Based on the Fibonacci sequence (each number is the sum of the two preceding ones)",
      calculateSizes: (settings) => {
        // Fibonacci ratios: 1, 1, 2, 3, 5, 8, 13, 21, ...
        const fibRatios = [8, 5, 3, 2, 1, 1];
        const baseSize = settings.baseFontSize;
        return fibRatios.map(ratio => Math.round(baseSize * ratio / 3));
      },
    },
    custom: {
      name: "Custom Ramp",
      description: "Define your own custom values for each heading level",
      calculateSizes: (settings) => {
        return settings.customRampValues;
      },
    },
  };

  // Default typography settings
  const defaultSettings: TypographySettings = {
    baseFontSize: 16,
    baseLineHeight: 1.5,
    scaleRatio: 1.2,
    paragraphSpacing: 1.5,
    headingSpacing: 1,
    listSpacing: 1,
    rampAlgorithm: "modular",
    minFontSize: 14,
    maxFontSize: 48,
    customRampValues: [48, 36, 24, 20, 16, 14],
    responsiveScaling: true,
    mobileScaleFactor: 0.75,
    tabletScaleFactor: 0.9,
    breakpointMobile: 480,
    breakpointTablet: 768,
    fontFamily: "Inter",
    headingFontFamily: "Inter",
    useSeparateHeadingFont: false,
    baseFontWeight: 400,
    fontWeightRampAlgorithm: "stepped",
    minFontWeight: 400,
    maxFontWeight: 700,
    customWeightRampValues: [700, 700, 600, 600, 500, 400],
    useWeightRamp: true,
  };

  // Popular Google Fonts
  const popularFonts: FontOption[] = [
    { family: "Inter", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Roboto", category: "sans-serif", variants: ["400", "500", "700"] },
    { family: "Open Sans", category: "sans-serif", variants: ["400", "600", "700"] },
    { family: "Lato", category: "sans-serif", variants: ["400", "700"] },
    { family: "Montserrat", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Poppins", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Raleway", category: "sans-serif", variants: ["400", "500", "600", "700"] },
    { family: "Merriweather", category: "serif", variants: ["400", "700"] },
    { family: "PT Serif", category: "serif", variants: ["400", "700"] },
    { family: "Playfair Display", category: "serif", variants: ["400", "500", "600", "700"] },
    { family: "Lora", category: "serif", variants: ["400", "500", "600", "700"] },
    { family: "Source Code Pro", category: "monospace", variants: ["400", "600"] },
    { family: "Fira Code", category: "monospace", variants: ["400", "500", "600", "700"] },
    { family: "JetBrains Mono", category: "monospace", variants: ["400", "500", "600", "700"] },
  ];

  const [settings, setSettings] = useState<TypographySettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("basic");
  const [exportFormat, setExportFormat] = useState<"css" | "sass" | "figma">("css");
  const [copySuccess, setCopySuccess] = useState("");
  const [previewViewport, setPreviewViewport] = useState<ViewportSize>("desktop");
  const [importMarkdownOpen, setImportMarkdownOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [markdownInput, setMarkdownInput] = useState("");
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>("none");
  
  // Default preview content
  const defaultPreviewContent = `
<h1>Typography Flow Preview</h1>
<p>This is a preview of your typography settings. Adjust the controls on the left to see how different settings affect the flow and readability of text on the page.</p>

<h2>Heading Level 2</h2>
<p>Typography is the art and technique of arranging type to make written language <strong>legible</strong>, <em>readable</em>, and <strong><em>appealing</em></strong> when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.</p>
<p>Good typography enhances readability, establishes hierarchy, and contributes to the overall aesthetic of a design. It helps guide the reader through the content in a logical and pleasing manner.</p>

<h3>Heading Level 3</h3>
<p>The term "typography" also refers to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process. Type design is a closely related craft, sometimes considered part of typography.</p>

<blockquote>
  <p>Typography is what language looks like.</p>
  <p><cite>— Ellen Lupton</cite></p>
</blockquote>

<h4>Heading Level 4</h4>
<ul>
  <li>Font size affects readability across different devices</li>
  <li>Line height (leading) impacts how easily text can be scanned</li>
  <li>Letter spacing (tracking) influences the density of text</li>
  <li>Paragraph spacing creates breathing room between blocks of text</li>
</ul>

<h5>Heading Level 5</h5>
<p>In traditional typography, text is composed to create a readable, coherent, and visually satisfying whole that works invisibly, without the awareness of the reader. Even distribution of typeset material, with a minimum of distractions and anomalies, aims to produce clarity and transparency.</p>

<pre><code>// Example code block
function calculateTypography(baseSize, ratio) {
  return {
    h1: baseSize * Math.pow(ratio, 4),
    h2: baseSize * Math.pow(ratio, 3),
    h3: baseSize * Math.pow(ratio, 2),
    h4: baseSize * Math.pow(ratio, 1),
    body: baseSize
  };
}</code></pre>

<h6>Heading Level 6</h6>
<ol>
  <li>Choose appropriate typefaces for your content</li>
  <li>Establish a clear hierarchy with different sizes</li>
  <li>Maintain consistent spacing throughout the document</li>
  <li>Consider the reading environment and audience</li>
</ol>

<hr>

<table>
  <thead>
    <tr>
      <th>Element</th>
      <th>Purpose</th>
      <th>Example Size</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Heading 1</td>
      <td>Main page title</td>
      <td>32px</td>
    </tr>
    <tr>
      <td>Heading 2</td>
      <td>Section headers</td>
      <td>24px</td>
    </tr>
    <tr>
      <td>Body text</td>
      <td>Main content</td>
      <td>16px</td>
    </tr>
  </tbody>
</table>
`;

  // Preview content state
  const [previewContent, setPreviewContent] = useState(defaultPreviewContent);
  
  // Function to calculate actual spacing in pixels for visualization
  const calculateActualSpacing = (emValue: number, baseFontSize: number) => {
    return Math.round(emValue * baseFontSize);
  };

  // Get scale factor based on viewport
  const getScaleFactor = (viewport: ViewportSize) => {
    switch (viewport) {
      case 'mobile': return settings.responsiveScaling ? settings.mobileScaleFactor : 1;
      case 'tablet': return settings.responsiveScaling ? settings.tabletScaleFactor : 1;
      case 'desktop': return 1;
      default: return 1;
    }
  };

  // Calculate heading sizes based on selected algorithm and viewport
  const calculateSizesForViewport = (viewport: ViewportSize) => {
    const scaleFactor = getScaleFactor(viewport);
    const baseHeadingSizes = rampAlgorithms[settings.rampAlgorithm].calculateSizes(settings);
    return baseHeadingSizes.map(size => Math.round(size * scaleFactor));
  };

  const headingSizes = calculateSizesForViewport(previewViewport);
  const [h1Size, h2Size, h3Size, h4Size, h5Size, h6Size] = headingSizes;

  // Calculate font weights based on selected algorithm
  const calculateFontWeights = () => {
    return weightRampAlgorithms[settings.fontWeightRampAlgorithm].calculateWeights(settings);
  };

  const headingWeights = calculateFontWeights();
  const [h1Weight, h2Weight, h3Weight, h4Weight, h5Weight, h6Weight] = headingWeights;

  // Calculate sizes for all viewports (for export)
  const desktopSizes = calculateSizesForViewport('desktop');
  const tabletSizes = calculateSizesForViewport('tablet');
  const mobileSizes = calculateSizesForViewport('mobile');

  // Update a specific setting
  const updateSetting = (key: keyof TypographySettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Update a custom ramp value
  const updateCustomRampValue = (index: number, value: number) => {
    const newCustomValues = [...settings.customRampValues];
    newCustomValues[index] = value;
    updateSetting("customRampValues", newCustomValues);
  };

  // Get required Google Fonts
  const getRequiredFonts = () => {
    const fonts = new Set<string>();
    fonts.add(settings.fontFamily);
    if (settings.useSeparateHeadingFont) {
      fonts.add(settings.headingFontFamily);
    }
    return Array.from(fonts);
  };

  // Create Google Fonts URL
  const createGoogleFontsUrl = () => {
    const fonts = getRequiredFonts();
    const fontFamilies = fonts.map(font => {
      const fontOption = popularFonts.find(f => f.family === font);
      if (fontOption) {
        return `family=${font.replace(/ /g, '+')}:wght@${fontOption.variants.join(';')}`;
      }
      return `family=${font.replace(/ /g, '+')}:wght@400;700`;
    });
    
    return `https://fonts.googleapis.com/css2?${fontFamilies.join('&')}&display=swap`;
  };

  // Generate CSS variables for the preview
  const previewStyles = {
    "--base-font-size": `${Math.round(settings.baseFontSize * getScaleFactor(previewViewport))}px`,
    "--base-line-height": settings.baseLineHeight,
    "--paragraph-spacing": `${settings.paragraphSpacing}em`,
    "--heading-spacing": `${settings.headingSpacing}em`,
    "--list-spacing": `${settings.listSpacing}em`,
    "--h1-size": `${h1Size}px`,
    "--h2-size": `${h2Size}px`,
    "--h3-size": `${h3Size}px`,
    "--h4-size": `${h4Size}px`,
    "--h5-size": `${h5Size}px`,
    "--h6-size": `${h6Size}px`,
    "--h1-weight": h1Weight,
    "--h2-weight": h2Weight,
    "--h3-weight": h3Weight,
    "--h4-weight": h4Weight,
    "--h5-weight": h5Weight,
    "--h6-weight": h6Weight,
    "--body-weight": settings.baseFontWeight,
    "fontFamily": settings.fontFamily,
  } as React.CSSProperties;

  // Get preview width based on viewport
  const getPreviewWidth = () => {
    switch (previewViewport) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  // Generate CSS code
  const generateCSSCode = (): string => {
    const [dh1, dh2, dh3, dh4, dh5, dh6] = desktopSizes;
    const [th1, th2, th3, th4, th5, th6] = tabletSizes;
    const [mh1, mh2, mh3, mh4, mh5, mh6] = mobileSizes;
    
    const desktopBaseFontSize = settings.baseFontSize;
    const tabletBaseFontSize = Math.round(settings.baseFontSize * settings.tabletScaleFactor);
    const mobileBaseFontSize = Math.round(settings.baseFontSize * settings.mobileScaleFactor);
    
    let css = `/* Typography Flow - Generated CSS */\n`;
    
    // Get font weights
    const fontWeights = settings.useWeightRamp ? 
      weightRampAlgorithms[settings.fontWeightRampAlgorithm].calculateWeights(settings) : 
      [700, 700, 600, 600, 500, 400];
    const [w1, w2, w3, w4, w5, w6] = fontWeights;
    
    // Mobile styles (base)
    if (settings.responsiveScaling) {
      css += `/* Mobile styles */
:root {
  --base-font-size: ${mobileBaseFontSize}px;
  --base-line-height: ${settings.baseLineHeight};
  --paragraph-spacing: ${settings.paragraphSpacing}em;
  --heading-spacing: ${settings.headingSpacing}em;
  --list-spacing: ${settings.listSpacing}em;
  --h1-size: ${mh1}px;
  --h2-size: ${mh2}px;
  --h3-size: ${mh3}px;
  --h4-size: ${mh4}px;
  --h5-size: ${mh5}px;
  --h6-size: ${mh6}px;
  --h1-weight: ${w1};
  --h2-weight: ${w2};
  --h3-weight: ${w3};
  --h4-weight: ${w4};
  --h5-weight: ${w5};
  --h6-weight: ${w6};
  --body-weight: ${settings.baseFontWeight};
}\n\n`;

      // Tablet styles
      css += `/* Tablet styles */
@media (min-width: ${settings.breakpointMobile}px) {
  :root {
    --base-font-size: ${tabletBaseFontSize}px;
    --h1-size: ${th1}px;
    --h2-size: ${th2}px;
    --h3-size: ${th3}px;
    --h4-size: ${th4}px;
    --h5-size: ${th5}px;
    --h6-size: ${th6}px;
  }
}\n\n`;

      // Desktop styles
      css += `/* Desktop styles */
@media (min-width: ${settings.breakpointTablet}px) {
  :root {
    --base-font-size: ${desktopBaseFontSize}px;
    --h1-size: ${dh1}px;
    --h2-size: ${dh2}px;
    --h3-size: ${dh3}px;
    --h4-size: ${dh4}px;
    --h5-size: ${dh5}px;
    --h6-size: ${dh6}px;
  }
}\n\n`;
    } else {
      // Non-responsive styles
      css += `:root {
  --base-font-size: ${settings.baseFontSize}px;
  --base-line-height: ${settings.baseLineHeight};
  --paragraph-spacing: ${settings.paragraphSpacing}em;
  --heading-spacing: ${settings.headingSpacing}em;
  --list-spacing: ${settings.listSpacing}em;
  --h1-size: ${dh1}px;
  --h2-size: ${dh2}px;
  --h3-size: ${dh3}px;
  --h4-size: ${dh4}px;
  --h5-size: ${dh5}px;
  --h6-size: ${dh6}px;
  --h1-weight: ${w1};
  --h2-weight: ${w2};
  --h3-weight: ${w3};
  --h4-weight: ${w4};
  --h5-weight: ${w5};
  --h6-weight: ${w6};
  --body-weight: ${settings.baseFontWeight};
}\n\n`;
    }

    // Common styles
    css += `/* Font imports */
@import url('https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap');
${settings.useSeparateHeadingFont && settings.headingFontFamily !== settings.fontFamily ? 
  `@import url('https://fonts.googleapis.com/css2?family=${settings.headingFontFamily.replace(/ /g, '+')}:wght@400;700&display=swap');` : ''}

body {
  font-size: var(--base-font-size);
  line-height: var(--base-line-height);
  font-family: "${settings.fontFamily}", sans-serif;
}

h1 {
  font-size: var(--h1-size);
  margin-bottom: var(--heading-spacing);
  line-height: 1.2;
  font-weight: var(--h1-weight);
  ${settings.useSeparateHeadingFont ? `font-family: "${settings.headingFontFamily}", sans-serif;` : ''}
}

h2 {
  font-size: var(--h2-size);
  margin-top: 1.5em;
  margin-bottom: var(--heading-spacing);
  line-height: 1.25;
  font-weight: var(--h2-weight);
  ${settings.useSeparateHeadingFont ? `font-family: "${settings.headingFontFamily}", sans-serif;` : ''}
}

h3 {
  font-size: var(--h3-size);
  margin-top: 1.5em;
  margin-bottom: var(--heading-spacing);
  line-height: 1.3;
  font-weight: var(--h3-weight);
  ${settings.useSeparateHeadingFont ? `font-family: "${settings.headingFontFamily}", sans-serif;` : ''}
}

h4 {
  font-size: var(--h4-size);
  margin-top: 1.5em;
  margin-bottom: var(--heading-spacing);
  line-height: 1.35;
  font-weight: var(--h4-weight);
  ${settings.useSeparateHeadingFont ? `font-family: "${settings.headingFontFamily}", sans-serif;` : ''}
}

h5 {
  font-size: var(--h5-size);
  margin-top: 1.5em;
  margin-bottom: var(--heading-spacing);
  line-height: 1.4;
  font-weight: var(--h5-weight);
  ${settings.useSeparateHeadingFont ? `font-family: "${settings.headingFontFamily}", sans-serif;` : ''}
}

h6 {
  font-size: var(--h6-size);
  margin-top: 1.5em;
  margin-bottom: var(--heading-spacing);
  line-height: 1.4;
  font-weight: var(--h6-weight);
  ${settings.useSeparateHeadingFont ? `font-family: "${settings.headingFontFamily}", sans-serif;` : ''}
}

p {
  margin-bottom: var(--paragraph-spacing);
}

ul, ol {
  margin-bottom: var(--paragraph-spacing);
  padding-left: 2em;
}

li {
  margin-bottom: var(--list-spacing);
}

li:last-child {
  margin-bottom: 0;
}`;

    return css;
  };

  // Generate SASS code
  const generateSASSCode = (): string => {
    const [dh1, dh2, dh3, dh4, dh5, dh6] = desktopSizes;
    const [th1, th2, th3, th4, th5, th6] = tabletSizes;
    const [mh1, mh2, mh3, mh4, mh5, mh6] = mobileSizes;
    
    const desktopBaseFontSize = settings.baseFontSize;
    const tabletBaseFontSize = Math.round(settings.baseFontSize * settings.tabletScaleFactor);
    const mobileBaseFontSize = Math.round(settings.baseFontSize * settings.mobileScaleFactor);
    
    let sass = `// Typography Flow - Generated SASS\n`;
    
    // Get font weights
    const fontWeights = settings.useWeightRamp ? 
      weightRampAlgorithms[settings.fontWeightRampAlgorithm].calculateWeights(settings) : 
      [700, 700, 600, 600, 500, 400];
    const [w1, w2, w3, w4, w5, w6] = fontWeights;

    // Font imports
    sass += `// Font imports
@import url('https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap');
${settings.useSeparateHeadingFont && settings.headingFontFamily !== settings.fontFamily ? 
  `@import url('https://fonts.googleapis.com/css2?family=${settings.headingFontFamily.replace(/ /g, '+')}:wght@400;700&display=swap');` : ''}

// Variables
// Breakpoints
$breakpoint-mobile: ${settings.breakpointMobile}px;
$breakpoint-tablet: ${settings.breakpointTablet}px;

// Font families
$body-font: "${settings.fontFamily}", sans-serif;
${settings.useSeparateHeadingFont ? `$heading-font: "${settings.headingFontFamily}", sans-serif;` : ''}

// Font weights
$body-weight: ${settings.baseFontWeight};
$h1-weight: ${w1};
$h2-weight: ${w2};
$h3-weight: ${w3};
$h4-weight: ${w4};
$h5-weight: ${w5};
$h6-weight: ${w6};

// Base typography settings
$base-line-height: ${settings.baseLineHeight};
$paragraph-spacing: ${settings.paragraphSpacing}em;
$heading-spacing: ${settings.headingSpacing}em;
$list-spacing: ${settings.listSpacing}em;\n\n`;

    if (settings.responsiveScaling) {
      sass += `// Mobile typography (base)
$base-font-size-mobile: ${mobileBaseFontSize}px;
$h1-size-mobile: ${mh1}px;
$h2-size-mobile: ${mh2}px;
$h3-size-mobile: ${mh3}px;
$h4-size-mobile: ${mh4}px;
$h5-size-mobile: ${mh5}px;
$h6-size-mobile: ${mh6}px;

// Tablet typography
$base-font-size-tablet: ${tabletBaseFontSize}px;
$h1-size-tablet: ${th1}px;
$h2-size-tablet: ${th2}px;
$h3-size-tablet: ${th3}px;
$h4-size-tablet: ${th4}px;
$h5-size-tablet: ${th5}px;
$h6-size-tablet: ${th6}px;

// Desktop typography
$base-font-size-desktop: ${desktopBaseFontSize}px;
$h1-size-desktop: ${dh1}px;
$h2-size-desktop: ${dh2}px;
$h3-size-desktop: ${dh3}px;
$h4-size-desktop: ${dh4}px;
$h5-size-desktop: ${dh5}px;
$h6-size-desktop: ${dh6}px;\n\n`;

      // Base styles (mobile)
      sass += `// Base styles (mobile first)
body {
  font-size: $base-font-size-mobile;
  line-height: $base-line-height;
  font-family: $body-font;
}

h1 {
  font-size: $h1-size-mobile;
  margin-bottom: $heading-spacing;
  line-height: 1.2;
  font-weight: $h1-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h2 {
  font-size: $h2-size-mobile;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.25;
  font-weight: $h2-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h3 {
  font-size: $h3-size-mobile;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.3;
  font-weight: $h3-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h4 {
  font-size: $h4-size-mobile;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.35;
  font-weight: $h4-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h5 {
  font-size: $h5-size-mobile;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.4;
  font-weight: $h5-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h6 {
  font-size: $h6-size-mobile;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.4;
  font-weight: $h6-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

// Tablet styles
@media (min-width: $breakpoint-mobile) {
  body {
    font-size: $base-font-size-tablet;
  }
  
  h1 {
    font-size: $h1-size-tablet;
  }
  
  h2 {
    font-size: $h2-size-tablet;
  }
  
  h3 {
    font-size: $h3-size-tablet;
  }
  
  h4 {
    font-size: $h4-size-tablet;
  }
  
  h5 {
    font-size: $h5-size-tablet;
  }
  
  h6 {
    font-size: $h6-size-tablet;
  }
}

// Desktop styles
@media (min-width: $breakpoint-tablet) {
  body {
    font-size: $base-font-size-desktop;
  }
  
  h1 {
    font-size: $h1-size-desktop;
  }
  
  h2 {
    font-size: $h2-size-desktop;
  }
  
  h3 {
    font-size: $h3-size-desktop;
  }
  
  h4 {
    font-size: $h4-size-desktop;
  }
  
  h5 {
    font-size: $h5-size-desktop;
  }
  
  h6 {
    font-size: $h6-size-desktop;
  }
}\n`;
    } else {
      // Non-responsive styles
      sass += `$base-font-size: ${settings.baseFontSize}px;
$h1-size: ${dh1}px;
$h2-size: ${dh2}px;
$h3-size: ${dh3}px;
$h4-size: ${dh4}px;
$h5-size: ${dh5}px;
$h6-size: ${dh6}px;

body {
  font-size: $base-font-size;
  line-height: $base-line-height;
  font-family: $body-font;
}

h1 {
  font-size: $h1-size;
  margin-bottom: $heading-spacing;
  line-height: 1.2;
  font-weight: $h1-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h2 {
  font-size: $h2-size;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.25;
  font-weight: $h2-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h3 {
  font-size: $h3-size;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.3;
  font-weight: $h3-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h4 {
  font-size: $h4-size;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.35;
  font-weight: $h4-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h5 {
  font-size: $h5-size;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.4;
  font-weight: $h5-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}

h6 {
  font-size: $h6-size;
  margin-top: 1.5em;
  margin-bottom: $heading-spacing;
  line-height: 1.4;
  font-weight: $h6-weight;
  ${settings.useSeparateHeadingFont ? 'font-family: $heading-font;' : ''}
}\n`;
    }

    // Common styles
    sass += `
p {
  margin-bottom: $paragraph-spacing;
}

ul, ol {
  margin-bottom: $paragraph-spacing;
  padding-left: 2em;
}

li {
  margin-bottom: $list-spacing;
}

li:last-child {
  margin-bottom: 0;
}`;

    return sass;
  };

  // Generate Figma design tokens
  const generateFigmaTokens = (): string => {
    const [dh1, dh2, dh3, dh4, dh5, dh6] = desktopSizes;
    const [th1, th2, th3, th4, th5, th6] = tabletSizes;
    const [mh1, mh2, mh3, mh4, mh5, mh6] = mobileSizes;
    
    const desktopBaseFontSize = settings.baseFontSize;
    const tabletBaseFontSize = Math.round(settings.baseFontSize * settings.tabletScaleFactor);
    const mobileBaseFontSize = Math.round(settings.baseFontSize * settings.mobileScaleFactor);
    
    // Get font weights
    const fontWeights = settings.useWeightRamp ? 
      weightRampAlgorithms[settings.fontWeightRampAlgorithm].calculateWeights(settings) : 
      [700, 700, 600, 600, 500, 400];
    const [w1, w2, w3, w4, w5, w6] = fontWeights;
    
    // Create Figma design tokens object
    const tokens = {
      "typography": {
        "fontFamilies": {
          "body": { "value": settings.fontFamily },
          "heading": { "value": settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily }
        },
        "fontWeights": {
          "body": { "value": settings.baseFontWeight.toString() },
          "h1": { "value": w1.toString() },
          "h2": { "value": w2.toString() },
          "h3": { "value": w3.toString() },
          "h4": { "value": w4.toString() },
          "h5": { "value": w5.toString() },
          "h6": { "value": w6.toString() }
        },
        "lineHeights": {
          "body": { "value": settings.baseLineHeight.toString() },
          "h1": { "value": "1.2" },
          "h2": { "value": "1.25" },
          "h3": { "value": "1.3" },
          "h4": { "value": "1.35" },
          "h5": { "value": "1.4" },
          "h6": { "value": "1.4" }
        },
        "fontSize": {
          "base": { "value": `${desktopBaseFontSize}px` },
          "h1": { "value": `${dh1}px` },
          "h2": { "value": `${dh2}px` },
          "h3": { "value": `${dh3}px` },
          "h4": { "value": `${dh4}px` },
          "h5": { "value": `${dh5}px` },
          "h6": { "value": `${dh6}px` }
        }
      },
      "spacing": {
        "paragraph": { "value": `${settings.paragraphSpacing}em` },
        "heading": { "value": `${settings.headingSpacing}em` },
        "list": { "value": `${settings.listSpacing}em` }
      }
    };
    
    // Add responsive sizes if enabled
    if (settings.responsiveScaling) {
      tokens.typography["responsiveSizes"] = {
        "breakpoints": {
          "mobile": { "value": `${settings.breakpointMobile}px` },
          "tablet": { "value": `${settings.breakpointTablet}px` }
        },
        "scaleFactors": {
          "mobile": { "value": settings.mobileScaleFactor.toString() },
          "tablet": { "value": settings.tabletScaleFactor.toString() }
        },
        "mobile": {
          "base": { "value": `${mobileBaseFontSize}px` },
          "h1": { "value": `${mh1}px` },
          "h2": { "value": `${mh2}px` },
          "h3": { "value": `${mh3}px` },
          "h4": { "value": `${mh4}px` },
          "h5": { "value": `${mh5}px` },
          "h6": { "value": `${mh6}px` }
        },
        "tablet": {
          "base": { "value": `${tabletBaseFontSize}px` },
          "h1": { "value": `${th1}px` },
          "h2": { "value": `${th2}px` },
          "h3": { "value": `${th3}px` },
          "h4": { "value": `${th4}px` },
          "h5": { "value": `${th5}px` },
          "h6": { "value": `${th6}px` }
        }
      };
    }
    
    return JSON.stringify(tokens, null, 2);
  };

  // Get the code based on the selected format
  const getExportCode = () => {
    if (exportFormat === "css") return generateCSSCode();
    if (exportFormat === "sass") return generateSASSCode();
    return generateFigmaTokens();
  };

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getExportCode());
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  return (
    <>
      <Head>
        <title>Typography Flow</title>
        <meta name="description" content="Typography Flow Experimentation App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={createGoogleFontsUrl()} rel="stylesheet" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Typography Flow</h1>
            <div className="flex gap-2">
              <Dialog open={importMarkdownOpen} onOpenChange={setImportMarkdownOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Import Preview Markdown</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Import Markdown for Preview</DialogTitle>
                    <DialogDescription>
                      Paste your markdown content below to use in the preview area.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    className="h-[400px] font-mono text-sm"
                    placeholder="# Heading 1
## Heading 2
### Heading 3

Regular paragraph with **bold** and *italic* text.

> Blockquote with a famous quote
> - Author Name

- Unordered list item 1
- Unordered list item 2

1. Ordered list item 1
2. Ordered list item 2

[Link text](https://example.com)

![Image alt text](https://example.com/image.jpg)

```js
// Code block
function example() {
  return 'Hello world';
}
```

| Table | Header | Cells |
|-------|--------|-------|
| Data  | Data   | Data  |
"
                    value={markdownInput}
                    onChange={(e) => setMarkdownInput(e.target.value)}
                  />
                  <DialogFooter className="mt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setPreviewContent(defaultPreviewContent)}
                    >
                      Reset to Default
                    </Button>
                    <Button 
                      onClick={async () => {
                        try {
                          // Convert markdown to HTML using our comprehensive parser
                          const html = await markdownToHtml(markdownInput);
                          setPreviewContent(html);
                          setImportMarkdownOpen(false);
                        } catch (error) {
                          console.error("Error converting markdown to HTML:", error);
                          // Fallback to simple conversion if the parser fails
                          alert("Error parsing markdown. Please check your input.");
                        }
                      }}
                    >
                      Import
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Export Code</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Export Typography Settings</DialogTitle>
                    <DialogDescription>
                      Copy the generated code to use in your project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 my-4 flex-wrap">
                    <Button
                      variant={exportFormat === "css" ? "default" : "outline"}
                      onClick={() => setExportFormat("css")}
                      className="flex-1"
                    >
                      CSS
                    </Button>
                    <Button
                      variant={exportFormat === "sass" ? "default" : "outline"}
                      onClick={() => setExportFormat("sass")}
                      className="flex-1"
                    >
                      SASS
                    </Button>
                    <Button
                      variant={exportFormat === "figma" ? "default" : "outline"}
                      onClick={() => setExportFormat("figma")}
                      className="flex-1"
                    >
                      Figma Tokens
                    </Button>
                  </div>
                  <Textarea
                    className="font-mono text-sm h-[400px] overflow-auto"
                    readOnly
                    value={getExportCode()}
                  />
                  <DialogFooter className="mt-4">
                    <Button onClick={copyToClipboard}>
                      {copySuccess || "Copy to Clipboard"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
            {/* Config Panel */}
            <Card className="w-full md:w-1/3 overflow-auto">
              <CardHeader>
                <CardTitle>Typography Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                    <TabsTrigger value="fonts" className="flex-1">Fonts</TabsTrigger>
                    <TabsTrigger value="ramps" className="flex-1">Ramps</TabsTrigger>
                    <TabsTrigger value="spacing" className="flex-1">Spacing</TabsTrigger>
                    <TabsTrigger value="responsive" className="flex-1">Responsive</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="fonts" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Body Font</Label>
                      <Select
                        value={settings.fontFamily}
                        onValueChange={(value) => updateSetting("fontFamily", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font family" />
                        </SelectTrigger>
                        <SelectContent>
                          {popularFonts.map((font) => (
                            <SelectItem key={font.family} value={font.family}>
                              {font.family} ({font.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Font used for body text and general content
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="checkbox"
                        id="useSeparateHeadingFont"
                        checked={settings.useSeparateHeadingFont}
                        onChange={(e) => updateSetting("useSeparateHeadingFont", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="useSeparateHeadingFont">Use different font for headings</Label>
                    </div>

                    {settings.useSeparateHeadingFont && (
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="headingFontFamily">Heading Font</Label>
                        <Select
                          value={settings.headingFontFamily}
                          onValueChange={(value) => updateSetting("headingFontFamily", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a font family" />
                          </SelectTrigger>
                          <SelectContent>
                            {popularFonts.map((font) => (
                              <SelectItem key={font.family} value={font.family}>
                                {font.family} ({font.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-1">
                          Font used for headings (h1-h6)
                        </p>
                      </div>
                    )}

                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Font Weights</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="useWeightRamp"
                            checked={settings.useWeightRamp}
                            onChange={(e) => updateSetting("useWeightRamp", e.target.checked)}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="useWeightRamp">Use font weight ramp for headings</Label>
                        </div>

                        {settings.useWeightRamp && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="fontWeightRampAlgorithm">Weight Ramp Algorithm</Label>
                              <Select
                                value={settings.fontWeightRampAlgorithm}
                                onValueChange={(value) => updateSetting("fontWeightRampAlgorithm", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a weight ramp algorithm" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(weightRampAlgorithms).map(([key, algorithm]) => (
                                    <SelectItem key={key} value={key}>
                                      {algorithm.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-muted-foreground mt-1">
                                {weightRampAlgorithms[settings.fontWeightRampAlgorithm].description}
                              </p>
                            </div>

                            {settings.fontWeightRampAlgorithm === "linear" && (
                              <>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label htmlFor="minFontWeight">Minimum Font Weight: {settings.minFontWeight}</Label>
                                    <Input
                                      id="minFontWeightInput"
                                      type="number"
                                      value={settings.minFontWeight}
                                      onChange={(e) => updateSetting("minFontWeight", Number(e.target.value))}
                                      className="w-16 h-8"
                                      min={100}
                                      max={settings.maxFontWeight - 100}
                                      step={100}
                                    />
                                  </div>
                                  <Slider
                                    id="minFontWeight"
                                    value={[settings.minFontWeight]}
                                    min={100}
                                    max={settings.maxFontWeight - 100}
                                    step={100}
                                    onValueChange={(value) => updateSetting("minFontWeight", value[0])}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <Label htmlFor="maxFontWeight">Maximum Font Weight: {settings.maxFontWeight}</Label>
                                    <Input
                                      id="maxFontWeightInput"
                                      type="number"
                                      value={settings.maxFontWeight}
                                      onChange={(e) => updateSetting("maxFontWeight", Number(e.target.value))}
                                      className="w-16 h-8"
                                      min={settings.minFontWeight + 100}
                                      max={900}
                                      step={100}
                                    />
                                  </div>
                                  <Slider
                                    id="maxFontWeight"
                                    value={[settings.maxFontWeight]}
                                    min={settings.minFontWeight + 100}
                                    max={900}
                                    step={100}
                                    onValueChange={(value) => updateSetting("maxFontWeight", value[0])}
                                  />
                                </div>
                              </>
                            )}

                            {settings.fontWeightRampAlgorithm === "custom" && (
                              <div className="space-y-3">
                                <h3 className="text-sm font-medium">Custom Heading Weights</h3>
                                {settings.customWeightRampValues.map((value, index) => (
                                  <div key={index} className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label htmlFor={`customWeight${index + 1}`}>H{index + 1} Weight: {value}</Label>
                                      <Input
                                        id={`customWeight${index + 1}Input`}
                                        type="number"
                                        value={value}
                                        onChange={(e) => {
                                          const newWeights = [...settings.customWeightRampValues];
                                          newWeights[index] = Number(e.target.value);
                                          updateSetting("customWeightRampValues", newWeights);
                                        }}
                                        className="w-16 h-8"
                                        min={100}
                                        max={900}
                                        step={100}
                                      />
                                    </div>
                                    <Slider
                                      id={`customWeight${index + 1}`}
                                      value={[value]}
                                      min={100}
                                      max={900}
                                      step={100}
                                      onValueChange={(val) => {
                                        const newWeights = [...settings.customWeightRampValues];
                                        newWeights[index] = val[0];
                                        updateSetting("customWeightRampValues", newWeights);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Font Preview</h3>
                      <div className="p-4 border rounded-md">
                        <p className="text-sm mb-2" style={{ fontFamily: settings.fontFamily }}>
                          Body text in <strong>{settings.fontFamily}</strong>
                        </p>
                        <h3 className="text-lg font-semibold" style={{ fontFamily: settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily }}>
                          Heading text in {settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily}
                        </h3>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="baseFontSize">Base Font Size: {settings.baseFontSize}px</Label>
                        <Input
                          id="baseFontSizeInput"
                          type="number"
                          value={settings.baseFontSize}
                          onChange={(e) => updateSetting("baseFontSize", Number(e.target.value))}
                          className="w-16 h-8"
                          min={8}
                          max={24}
                        />
                      </div>
                      <Slider
                        id="baseFontSize"
                        value={[settings.baseFontSize]}
                        min={8}
                        max={24}
                        step={1}
                        onValueChange={(value) => updateSetting("baseFontSize", value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="baseLineHeight">Line Height: {settings.baseLineHeight.toFixed(1)}</Label>
                        <Input
                          id="baseLineHeightInput"
                          type="number"
                          value={settings.baseLineHeight}
                          onChange={(e) => updateSetting("baseLineHeight", Number(e.target.value))}
                          className="w-16 h-8"
                          min={1}
                          max={2.5}
                          step={0.1}
                        />
                      </div>
                      <Slider
                        id="baseLineHeight"
                        value={[settings.baseLineHeight]}
                        min={1}
                        max={2.5}
                        step={0.1}
                        onValueChange={(value) => updateSetting("baseLineHeight", value[0])}
                      />
                    </div>

                    {settings.rampAlgorithm === "modular" && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="scaleRatio">Scale Ratio: {settings.scaleRatio.toFixed(1)}</Label>
                          <Input
                            id="scaleRatioInput"
                            type="number"
                            value={settings.scaleRatio}
                            onChange={(e) => updateSetting("scaleRatio", Number(e.target.value))}
                            className="w-16 h-8"
                            min={1.0}
                            max={2.0}
                            step={0.1}
                          />
                        </div>
                        <Slider
                          id="scaleRatio"
                          value={[settings.scaleRatio]}
                          min={1.0}
                          max={2.0}
                          step={0.1}
                          onValueChange={(value) => updateSetting("scaleRatio", value[0])}
                        />
                      </div>
                    )}

                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Heading Sizes (Calculated)</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>H1: {h1Size}px</div>
                        <div>H2: {h2Size}px</div>
                        <div>H3: {h3Size}px</div>
                        <div>H4: {h4Size}px</div>
                        <div>H5: {h5Size}px</div>
                        <div>H6: {h6Size}px</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ramps" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="rampAlgorithm">Ramp Algorithm</Label>
                      <Select
                        value={settings.rampAlgorithm}
                        onValueChange={(value) => updateSetting("rampAlgorithm", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a ramp algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(rampAlgorithms).map(([key, algorithm]) => (
                            <SelectItem key={key} value={key}>
                              {algorithm.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rampAlgorithms[settings.rampAlgorithm].description}
                      </p>
                    </div>

                    {settings.rampAlgorithm === "linear" && (
                      <>
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between">
                            <Label htmlFor="minFontSize">Minimum Font Size: {settings.minFontSize}px</Label>
                            <Input
                              id="minFontSizeInput"
                              type="number"
                              value={settings.minFontSize}
                              onChange={(e) => updateSetting("minFontSize", Number(e.target.value))}
                              className="w-16 h-8"
                              min={8}
                              max={settings.maxFontSize - 1}
                            />
                          </div>
                          <Slider
                            id="minFontSize"
                            value={[settings.minFontSize]}
                            min={8}
                            max={settings.maxFontSize - 1}
                            step={1}
                            onValueChange={(value) => updateSetting("minFontSize", value[0])}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="maxFontSize">Maximum Font Size: {settings.maxFontSize}px</Label>
                            <Input
                              id="maxFontSizeInput"
                              type="number"
                              value={settings.maxFontSize}
                              onChange={(e) => updateSetting("maxFontSize", Number(e.target.value))}
                              className="w-16 h-8"
                              min={settings.minFontSize + 1}
                              max={100}
                            />
                          </div>
                          <Slider
                            id="maxFontSize"
                            value={[settings.maxFontSize]}
                            min={settings.minFontSize + 1}
                            max={100}
                            step={1}
                            onValueChange={(value) => updateSetting("maxFontSize", value[0])}
                          />
                        </div>
                      </>
                    )}

                    {settings.rampAlgorithm === "custom" && (
                      <div className="space-y-3 mt-4">
                        <h3 className="text-sm font-medium">Custom Heading Sizes</h3>
                        {settings.customRampValues.map((value, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor={`customSize${index + 1}`}>H{index + 1} Size: {value}px</Label>
                              <Input
                                id={`customSize${index + 1}Input`}
                                type="number"
                                value={value}
                                onChange={(e) => updateCustomRampValue(index, Number(e.target.value))}
                                className="w-16 h-8"
                                min={8}
                                max={100}
                              />
                            </div>
                            <Slider
                              id={`customSize${index + 1}`}
                              value={[value]}
                              min={8}
                              max={100}
                              step={1}
                              onValueChange={(val) => updateCustomRampValue(index, val[0])}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Heading Sizes (Calculated)</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>H1: {h1Size}px</div>
                        <div>H2: {h2Size}px</div>
                        <div>H3: {h3Size}px</div>
                        <div>H4: {h4Size}px</div>
                        <div>H5: {h5Size}px</div>
                        <div>H6: {h6Size}px</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="spacing" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="paragraphSpacing">Paragraph Spacing: {settings.paragraphSpacing.toFixed(1)}em</Label>
                        <Input
                          id="paragraphSpacingInput"
                          type="number"
                          value={settings.paragraphSpacing}
                          onChange={(e) => updateSetting("paragraphSpacing", Number(e.target.value))}
                          className="w-16 h-8"
                          min={0.5}
                          max={3}
                          step={0.1}
                        />
                      </div>
                      <Slider
                        id="paragraphSpacing"
                        value={[settings.paragraphSpacing]}
                        min={0.5}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => updateSetting("paragraphSpacing", value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="headingSpacing">Heading Spacing: {settings.headingSpacing.toFixed(1)}em</Label>
                        <Input
                          id="headingSpacingInput"
                          type="number"
                          value={settings.headingSpacing}
                          onChange={(e) => updateSetting("headingSpacing", Number(e.target.value))}
                          className="w-16 h-8"
                          min={0.5}
                          max={3}
                          step={0.1}
                        />
                      </div>
                      <Slider
                        id="headingSpacing"
                        value={[settings.headingSpacing]}
                        min={0.5}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => updateSetting("headingSpacing", value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="listSpacing">List Item Spacing: {settings.listSpacing.toFixed(1)}em</Label>
                        <Input
                          id="listSpacingInput"
                          type="number"
                          value={settings.listSpacing}
                          onChange={(e) => updateSetting("listSpacing", Number(e.target.value))}
                          className="w-16 h-8"
                          min={0.5}
                          max={3}
                          step={0.1}
                        />
                      </div>
                      <Slider
                        id="listSpacing"
                        value={[settings.listSpacing]}
                        min={0.5}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => updateSetting("listSpacing", value[0])}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="responsive" className="space-y-4 mt-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="responsiveScaling"
                        checked={settings.responsiveScaling}
                        onChange={(e) => updateSetting("responsiveScaling", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="responsiveScaling">Enable Responsive Scaling</Label>
                    </div>

                    {settings.responsiveScaling && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="mobileScaleFactor">Mobile Scale Factor: {settings.mobileScaleFactor.toFixed(2)}</Label>
                            <Input
                              id="mobileScaleFactorInput"
                              type="number"
                              value={settings.mobileScaleFactor}
                              onChange={(e) => updateSetting("mobileScaleFactor", Number(e.target.value))}
                              className="w-16 h-8"
                              min={0.5}
                              max={1}
                              step={0.05}
                            />
                          </div>
                          <Slider
                            id="mobileScaleFactor"
                            value={[settings.mobileScaleFactor]}
                            min={0.5}
                            max={1}
                            step={0.05}
                            onValueChange={(value) => updateSetting("mobileScaleFactor", value[0])}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Scale factor for mobile devices (smaller screens)
                          </p>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between">
                            <Label htmlFor="tabletScaleFactor">Tablet Scale Factor: {settings.tabletScaleFactor.toFixed(2)}</Label>
                            <Input
                              id="tabletScaleFactorInput"
                              type="number"
                              value={settings.tabletScaleFactor}
                              onChange={(e) => updateSetting("tabletScaleFactor", Number(e.target.value))}
                              className="w-16 h-8"
                              min={0.6}
                              max={1}
                              step={0.05}
                            />
                          </div>
                          <Slider
                            id="tabletScaleFactor"
                            value={[settings.tabletScaleFactor]}
                            min={0.6}
                            max={1}
                            step={0.05}
                            onValueChange={(value) => updateSetting("tabletScaleFactor", value[0])}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Scale factor for tablet devices (medium screens)
                          </p>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between">
                            <Label htmlFor="breakpointMobile">Mobile Breakpoint: {settings.breakpointMobile}px</Label>
                            <Input
                              id="breakpointMobileInput"
                              type="number"
                              value={settings.breakpointMobile}
                              onChange={(e) => updateSetting("breakpointMobile", Number(e.target.value))}
                              className="w-16 h-8"
                              min={320}
                              max={settings.breakpointTablet - 1}
                              step={1}
                            />
                          </div>
                          <Slider
                            id="breakpointMobile"
                            value={[settings.breakpointMobile]}
                            min={320}
                            max={settings.breakpointTablet - 1}
                            step={1}
                            onValueChange={(value) => updateSetting("breakpointMobile", value[0])}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Screen width where styles transition from mobile to tablet
                          </p>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between">
                            <Label htmlFor="breakpointTablet">Tablet Breakpoint: {settings.breakpointTablet}px</Label>
                            <Input
                              id="breakpointTabletInput"
                              type="number"
                              value={settings.breakpointTablet}
                              onChange={(e) => updateSetting("breakpointTablet", Number(e.target.value))}
                              className="w-16 h-8"
                              min={settings.breakpointMobile + 1}
                              max={1200}
                              step={1}
                            />
                          </div>
                          <Slider
                            id="breakpointTablet"
                            value={[settings.breakpointTablet]}
                            min={settings.breakpointMobile + 1}
                            max={1200}
                            step={1}
                            onValueChange={(value) => updateSetting("breakpointTablet", value[0])}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Screen width where styles transition from tablet to desktop
                          </p>
                        </div>

                        <div className="mt-6">
                          <h3 className="text-sm font-medium mb-2">Preview Viewport</h3>
                          <div className="flex gap-2">
                            <Button 
                              variant={previewViewport === 'mobile' ? 'default' : 'outline'}
                              onClick={() => setPreviewViewport('mobile')}
                              className="flex-1"
                            >
                              Mobile
                            </Button>
                            <Button 
                              variant={previewViewport === 'tablet' ? 'default' : 'outline'}
                              onClick={() => setPreviewViewport('tablet')}
                              className="flex-1"
                            >
                              Tablet
                            </Button>
                            <Button 
                              variant={previewViewport === 'desktop' ? 'default' : 'outline'}
                              onClick={() => setPreviewViewport('desktop')}
                              className="flex-1"
                            >
                              Desktop
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Preview Area */}
            <Card className="w-full md:w-2/3 overflow-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>Preview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={visualizationMode === 'spacing' ? 'default' : 'outline'}
                      onClick={() => setVisualizationMode(visualizationMode === 'spacing' ? 'none' : 'spacing')}
                      size="sm"
                      title="Visualize margins, line heights, and spacing between elements"
                    >
                      {visualizationMode === 'spacing' ? 'Hide Spacing' : 'Show Spacing'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={previewViewport === 'mobile' ? 'default' : 'outline'}
                    onClick={() => setPreviewViewport('mobile')}
                    size="sm"
                  >
                    Mobile
                  </Button>
                  <Button 
                    variant={previewViewport === 'tablet' ? 'default' : 'outline'}
                    onClick={() => setPreviewViewport('tablet')}
                    size="sm"
                  >
                    Tablet
                  </Button>
                  <Button 
                    variant={previewViewport === 'desktop' ? 'default' : 'outline'}
                    onClick={() => setPreviewViewport('desktop')}
                    size="sm"
                  >
                    Desktop
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex justify-center">
                    <div 
                      className={`typography-preview ${visualizationMode === 'spacing' ? 'spacing-visualization' : ''}`}
                      style={{
                        ...previewStyles,
                        width: getPreviewWidth(),
                        border: previewViewport !== 'desktop' ? '1px solid #ddd' : 'none',
                        padding: previewViewport !== 'desktop' ? '16px' : '0',
                        transition: 'width 0.3s ease'
                      }}
                      data-px={calculateActualSpacing(1.5, Math.round(settings.baseFontSize * getScaleFactor(previewViewport)))}
                      data-heading-mb-px={calculateActualSpacing(settings.headingSpacing, Math.round(settings.baseFontSize * getScaleFactor(previewViewport)))}
                      data-paragraph-mb-px={calculateActualSpacing(settings.paragraphSpacing, Math.round(settings.baseFontSize * getScaleFactor(previewViewport)))}
                      data-list-mb-px={calculateActualSpacing(settings.listSpacing, Math.round(settings.baseFontSize * getScaleFactor(previewViewport)))}
                      dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPreviewContent(defaultPreviewContent)}
                    >
                      Reset to Default Text
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .typography-preview {
          font-size: var(--base-font-size);
          line-height: var(--base-line-height);
          font-family: "${settings.fontFamily}", sans-serif;
        }
        
        .typography-preview h1 {
          font-size: var(--h1-size);
          margin-bottom: var(--heading-spacing);
          line-height: 1.2;
          font-weight: var(--h1-weight);
          font-family: "${settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily}", sans-serif;
        }
        
        .typography-preview h2 {
          font-size: var(--h2-size);
          margin-top: 1.5em;
          margin-bottom: var(--heading-spacing);
          line-height: 1.25;
          font-weight: var(--h2-weight);
          font-family: "${settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily}", sans-serif;
        }
        
        .typography-preview h3 {
          font-size: var(--h3-size);
          margin-top: 1.5em;
          margin-bottom: var(--heading-spacing);
          line-height: 1.3;
          font-weight: var(--h3-weight);
          font-family: "${settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily}", sans-serif;
        }
        
        .typography-preview h4 {
          font-size: var(--h4-size);
          margin-top: 1.5em;
          margin-bottom: var(--heading-spacing);
          line-height: 1.35;
          font-weight: var(--h4-weight);
          font-family: "${settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily}", sans-serif;
        }
        
        .typography-preview h5 {
          font-size: var(--h5-size);
          margin-top: 1.5em;
          margin-bottom: var(--heading-spacing);
          line-height: 1.4;
          font-weight: var(--h5-weight);
          font-family: "${settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily}", sans-serif;
        }
        
        .typography-preview h6 {
          font-size: var(--h6-size);
          margin-top: 1.5em;
          margin-bottom: var(--heading-spacing);
          line-height: 1.4;
          font-weight: var(--h6-weight);
          font-family: "${settings.useSeparateHeadingFont ? settings.headingFontFamily : settings.fontFamily}", sans-serif;
        }
        
        .typography-preview p {
          margin-bottom: var(--paragraph-spacing);
        }
        
        .typography-preview ul, 
        .typography-preview ol {
          margin-bottom: var(--paragraph-spacing);
          padding-left: 2em;
        }
        
        .typography-preview li {
          margin-bottom: var(--list-spacing);
        }
        
        .typography-preview li:last-child {
          margin-bottom: 0;
        }
        
        .typography-preview blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: #666;
        }
        
        .typography-preview code {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        .typography-preview pre {
          background-color: #f5f5f5;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin-bottom: var(--paragraph-spacing);
        }
        
        .typography-preview pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          font-size: 0.9em;
          display: block;
        }
        
        .typography-preview table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: var(--paragraph-spacing);
        }
        
        .typography-preview th, 
        .typography-preview td {
          border: 1px solid #ddd;
          padding: 0.5em;
          text-align: left;
        }
        
        .typography-preview th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .typography-preview hr {
          border: 0;
          border-top: 1px solid #ddd;
          margin: 2em 0;
        }
        
        .typography-preview img {
          max-width: 100%;
          height: auto;
          margin-bottom: var(--paragraph-spacing);
        }
        
        .typography-preview a {
          color: #0070f3;
          text-decoration: underline;
        }
        
        .typography-preview strong {
          font-weight: bold;
        }
        
        .typography-preview em {
          font-style: italic;
        }
        
        /* Spacing visualization styles */
        .spacing-visualization * {
          position: relative;
        }
        
        /* Margin visualization */
        .spacing-visualization h1,
        .spacing-visualization h2,
        .spacing-visualization h3,
        .spacing-visualization h4,
        .spacing-visualization h5,
        .spacing-visualization h6,
        .spacing-visualization p,
        .spacing-visualization ul,
        .spacing-visualization ol,
        .spacing-visualization blockquote,
        .spacing-visualization pre,
        .spacing-visualization table {
          background-color: rgba(173, 216, 230, 0.1);
          outline: 1px dashed rgba(0, 0, 255, 0.2);
        }
        
        /* Margin-top visualization */
        .spacing-visualization h1::before,
        .spacing-visualization h2::before,
        .spacing-visualization h3::before,
        .spacing-visualization h4::before,
        .spacing-visualization h5::before,
        .spacing-visualization h6::before {
          content: "";
          position: absolute;
          top: calc(-1.5em - 2px);
          left: 0;
          width: 100%;
          height: 1.5em;
          background: repeating-linear-gradient(
            45deg,
            rgba(255, 0, 0, 0.05),
            rgba(255, 0, 0, 0.05) 5px,
            rgba(255, 165, 0, 0.05) 5px,
            rgba(255, 165, 0, 0.05) 10px
          );
          border: 1px dashed rgba(255, 0, 0, 0.3);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Margin-bottom visualization */
        .spacing-visualization h1::after,
        .spacing-visualization h2::after,
        .spacing-visualization h3::after,
        .spacing-visualization h4::after,
        .spacing-visualization h5::after,
        .spacing-visualization h6::after,
        .spacing-visualization p::after,
        .spacing-visualization ul::after,
        .spacing-visualization ol::after,
        .spacing-visualization blockquote::after,
        .spacing-visualization pre::after,
        .spacing-visualization table::after {
          content: "";
          position: absolute;
          bottom: calc(-1 * var(--paragraph-spacing) - 2px);
          left: 0;
          width: 100%;
          height: var(--paragraph-spacing);
          background: repeating-linear-gradient(
            45deg,
            rgba(0, 128, 0, 0.05),
            rgba(0, 128, 0, 0.05) 5px,
            rgba(144, 238, 144, 0.05) 5px,
            rgba(144, 238, 144, 0.05) 10px
          );
          border: 1px dashed rgba(0, 128, 0, 0.3);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Line height visualization */
        .spacing-visualization p,
        .spacing-visualization li {
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent calc(1em - 1px),
            rgba(255, 192, 203, 0.1) calc(1em - 1px),
            rgba(255, 192, 203, 0.1) 1em
          );
          background-size: 100% var(--base-line-height)em;
          background-position: 0 0;
        }
        
        /* List item spacing visualization */
        .spacing-visualization li {
          position: relative;
        }
        
        .spacing-visualization li:not(:last-child)::after {
          content: "margin-bottom: " var(--list-spacing) "em (" attr(data-list-mb-px) "px)";
          position: absolute;
          bottom: calc(-1 * var(--list-spacing) - 2px);
          left: 0;
          width: 100%;
          height: var(--list-spacing);
          background: repeating-linear-gradient(
            45deg,
            rgba(128, 0, 128, 0.05),
            rgba(128, 0, 128, 0.05) 5px,
            rgba(221, 160, 221, 0.05) 5px,
            rgba(221, 160, 221, 0.05) 10px
          );
          border: 1px dashed rgba(128, 0, 128, 0.3);
          pointer-events: none;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(128, 0, 128, 0.7);
          font-family: monospace;
        }
        
        /* Add labels to show the actual spacing values */
        .spacing-visualization h1::before,
        .spacing-visualization h2::before,
        .spacing-visualization h3::before,
        .spacing-visualization h4::before,
        .spacing-visualization h5::before,
        .spacing-visualization h6::before {
          content: "margin-top: 1.5em (" attr(data-px) "px)";
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(255, 0, 0, 0.7);
          font-family: monospace;
        }
        
        .spacing-visualization h1::after {
          content: "margin-bottom: " var(--heading-spacing) "em (" attr(data-heading-mb-px) "px)";
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(0, 128, 0, 0.7);
          font-family: monospace;
        }
        
        .spacing-visualization h2::after,
        .spacing-visualization h3::after,
        .spacing-visualization h4::after,
        .spacing-visualization h5::after,
        .spacing-visualization h6::after {
          content: "margin-bottom: " var(--heading-spacing) "em (" attr(data-heading-mb-px) "px)";
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(0, 128, 0, 0.7);
          font-family: monospace;
        }
        
        .spacing-visualization p::after,
        .spacing-visualization blockquote::after,
        .spacing-visualization pre::after,
        .spacing-visualization table::after {
          content: "margin-bottom: " var(--paragraph-spacing) "em (" attr(data-paragraph-mb-px) "px)";
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(0, 128, 0, 0.7);
          font-family: monospace;
        }
        
        .spacing-visualization ul::after,
        .spacing-visualization ol::after {
          content: "margin-bottom: " var(--paragraph-spacing) "em (" attr(data-paragraph-mb-px) "px)";
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(0, 128, 0, 0.7);
          font-family: monospace;
        }
        
        /* Add a legend for the visualization */
        .spacing-visualization::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px;
          font-size: 12px;
          width: 180px;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .spacing-visualization::after {
          content: "Spacing Legend:\\A \\A Red: Margin Top\\A Green: Margin Bottom\\A Purple: List Item Spacing\\A Pink Lines: Line Height\\A Blue Outline: Element Bounds";
          position: absolute;
          top: 8px;
          right: 8px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px;
          font-size: 12px;
          width: 180px;
          white-space: pre;
          line-height: 1.5;
          color: #333;
          z-index: 10;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
}
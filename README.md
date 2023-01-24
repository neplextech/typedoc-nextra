# typedoc-nextra

Use TypeDoc with Nextra

# Installation

```sh
yarn add typedoc-nextra
```

> This tool was built for generating docs automatically to be used in nextra. However, it can be used elsewhere.

# Output Directory Structure

* output/
  * classes/
    * module/
      * class.mdx
  * types/
    * module/
      * type.mdx
  * custom/
    * file.mdx

# Example

```js
import { createDocumentation } from 'typedoc-nextra';

await createDocumentation({
    // use existing typedoc json output (leave it blank to auto generate)
    jsonInputPath: `${__dirname}/data.json`,
    // output location
    output: `${__dirname}/pages`,
    // output markdown
    markdown: true
});
```
**This project has been replaced by [micro-docgen](https://github.com/neplextech/micro-docgen)**

---

# typedoc-nextra

Generate markdown/simple json from typedoc

# Installation

```sh
yarn add typedoc-nextra typedoc
```

# Output Directory Structure

-   output/
    -   classes/
        -   module/
            -   class.mdx
    -   types/
        -   module/
            -   type.mdx
    -   custom/
        -   file.mdx

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

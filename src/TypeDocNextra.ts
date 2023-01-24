import { stripIndents } from 'common-tags';
import { DocumentedClass, DocumentedClassConstructor, DocumentedClassMethod, DocumentedClassProperty, DocumentedTypes } from './serializers';
import { bold, code, codeBlock, heading, hyperlink, table } from './utils/md';
import { FileMetadata, escape } from './utils';

export interface TypeDocNextraMarkdownBuild {
    name: string;
    metadata: FileMetadata | null;
    content: string;
}

export interface TypeDocNextraMdBuilderOptions {
    linker: (t: string, s?: string) => string;
}

export class TypeDocNextra {
    public linker: typeof this.options.linker;
    public constructor(public options: TypeDocNextraMdBuilderOptions) {
        this.linker = this.options.linker;
    }

    public getClassHeading(c: DocumentedClass) {
        return `${heading(escape(c.name), 2)}${c.extends ? ` extends ${this.linker(escape(c.extends), c.extends)}` : ''}${
            c.implements ? ` implements ${this.linker(escape(c.implements), c.implements)}` : ''
        }${c.description ? `\n${c.description}\n` : ''}`;
    }

    public getCtor(c: DocumentedClassConstructor) {
        if (!c) return '';

        const ctor = codeBlock(
            `${escape(c.constructor)}(${c.parameters
                .filter((p) => !p.name.includes('.'))
                .map((m) => m.name)
                .join(', ')})`,
            'typescript'
        );

        if (c.parameters.length) {
            const tableHead = ['Parameter', 'Type', 'Optional', 'Description'];
            const tableBody = c.parameters.map((m) => [escape(m.name), this.linker(escape(m.type || 'any'), m.type || 'any'), m.optional ? '✅' : '❌', m.description || '-']);

            return `\n${ctor}\n${table(tableHead, tableBody)}\n`;
        }

        return `\n${ctor}\n`;
    }

    public transformClass(classes: DocumentedClass[]): TypeDocNextraMarkdownBuild[] {
        return classes.map((c) => {
            return {
                name: c.name,
                metadata: c.metadata,
                content: this.getMarkdown(c)
            };
        });
    }

    public transformTypes(types: DocumentedTypes[]): TypeDocNextraMarkdownBuild[] {
        return types.map((t) => {
            return {
                name: t.name,
                metadata: t.metadata,
                content: this.getTypeMarkdown(t)
            };
        });
    }

    public getTypeMarkdown(t: DocumentedTypes) {
        return stripIndents`${heading(escape(t.name), 2)}${t.description ? '\n' + t.description : ''}
        ${t.deprecated ? `\n- ${bold('⚠️ Deprecated')}` : ''}
        ${
            t.properties.length
                ? (() => {
                      const tableHead = ['Property', 'Type', 'Value', 'Description'];
                      const tableBody = t.properties.map((n) => [escape(n.name), this.linker(escape(n.type || 'any'), n.type || 'any'), escape(n.value || 'N/A'), n.description || '-']);

                      return `\n${table(tableHead, tableBody)}\n`;
                  })()
                : ''
        }
        ${
            t.metadata
                ? (() => {
                      if (t.metadata.url) {
                          return `\n- ${hyperlink('Source', t.metadata.url)}`;
                      } else {
                          return `\n- Source: ${code(`${t.metadata.directory}/${t.metadata.name}#L${t.metadata.line}`)}`;
                      }
                  })()
                : ''
        }`.trim();
    }

    public getMarkdown(c: DocumentedClass) {
        return stripIndents`${this.getClassHeading(c)}
        ${this.getCtor(c.constructor!)}
        ${this.getProperties(c.properties)}
        ${this.getMethods(c.methods)}`;
    }

    public getProperties(properties: DocumentedClassProperty[]) {
        if (!properties.length) return '';

        const head = heading('Properties', 2);
        const body = properties.map((m) => {
            const name = `${m.private ? 'private' : 'public'} ${m.static ? 'static' : ''} ${escape(m.name)}`.trim();
            const title = heading(`${name}: ${this.linker(escape(m.type || 'any'), m.type || 'any')}`, 3);
            const desc = stripIndents`${m.description || ''}            
            ${m.deprecated ? `\n- ${bold('⚠️ Deprecated')}` : ''}
            ${
                m.metadata
                    ? (() => {
                          if (m.metadata.url) {
                              return `\n- ${hyperlink('Source', m.metadata.url)}`;
                          } else {
                              return `\n- Source: ${code(`${m.metadata.directory}/${m.metadata.name}#L${m.metadata.line}`)}`;
                          }
                      })()
                    : ''
            }`.trim();

            return `${title}\n${desc}`;
        });

        return `${head}\n${body.join('\n')}`;
    }

    public getMethods(methods: DocumentedClassMethod[]) {
        if (!methods.length) return '';

        const head = heading('Methods', 2);
        const body = methods.map((m) => {
            const name = `${m.private ? `private` : `public`} ${m.static ? 'static' : ''} ${escape(m.name)}(${m.parameters
                .filter((r) => !r.name.includes('.'))
                .map((m) => {
                    return `${m.name}${m.optional ? '?' : ''}`;
                })
                .join(', ')})`.trim();
            const title = heading(`${name}: ${m.returns?.type ? `${this.linker(escape(m.returns.type), m.returns.type)}` : 'any'}`, 3);
            const desc = stripIndents`${m.description || ''}
            ${m.deprecated ? `\n- ${bold('⚠️ Deprecated')}` : ''}
            ${m.examples ? '\n' + m.examples.map((m) => codeBlock(m, 'typescript')).join('\n\n') : ''}
            ${
                m.parameters.length
                    ? (() => {
                          const tableHead = ['Parameter', 'Type', 'Optional', 'Description'];
                          const tableBody = m.parameters.map((n) => [
                              n.default ? `${escape(n.name)}=${code(escape(n.default))}` : escape(n.name),
                              this.linker(escape(n.type || 'any'), n.type || 'any'),
                              n.optional ? '✅' : '❌',
                              n.description || '-'
                          ]);

                          return `\n${table(tableHead, tableBody)}\n`;
                      })()
                    : ''
            }
            ${
                m.metadata
                    ? (() => {
                          if (m.metadata.url) {
                              return `\n- ${hyperlink('Source', m.metadata.url)}`;
                          } else {
                              return `\n- Source: ${code(`${m.metadata.directory}/${m.metadata.name}#L${m.metadata.line}`)}`;
                          }
                      })()
                    : ''
            }`.trim();

            return `${title}\n${desc}`;
        });

        return `${head}\n${body.join('\n')}`;
    }
}

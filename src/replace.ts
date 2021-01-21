import * as Shift from 'shift-ast';
import Spec from 'shift-spec';
import { isShiftNode, RefactorSessionChainable } from 'shift-refactor';

interface ReplaceVisitor {
    enter(node: Shift.Node, parent: Shift.Node): Shift.Node | void;
}

/**
 * Traverses a Shift AST or AST node and replaces specified nodes. Cannot replace the outermost node.
 * @param node The Shift AST or AST node.
 * @param visitor The visitor object.
 * @param parent The parent node (optional, only used internally).
 * @param parentField The parent field (optional, only used internally).
 */
export function replace(node: Shift.Node | RefactorSessionChainable, visitor: ReplaceVisitor, parent?: Shift.Node, parentField?: string): void {
    if (node instanceof RefactorSessionChainable) {
        var script = node.$('*[type=/Script|Module/]').raw();
        if (!script) {
            throw new Error('Failed to find a Script or Module.');
        }
        return replace(script, visitor);
    }

    if (parent && parentField) {
        let replacement = visitor.enter(node, parent);
        if (replacement) {
            (parent as any)[parentField] = replacement;
        }
    }

    let type = Spec[node.type];
    if (!type) {
        throw new Error(`Unknown node type ${node.type}`);
    }

    let fields = type.fields.filter((f: any) => f.name !== 'type');
    for (let field of fields) {
        let value = (node as any)[field.name];
        if (value) {
            if (value instanceof Array) {
                value.forEach((e: any) => {
                    if (isShiftNode(e)) {
                        replace(e, visitor, node, field.name);
                    }
                });
            } else if (isShiftNode(value)) {
                replace(value, visitor, node, field.name);
            }
        }
    }
}
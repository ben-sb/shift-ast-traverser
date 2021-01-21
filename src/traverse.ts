import * as Shift from 'shift-ast';
import Spec from 'shift-spec';
import { isShiftNode, RefactorSessionChainable } from 'shift-refactor';

interface TraversalVisitor {
    enter(node: Shift.Node, parent?: Shift.Node): any;
    leave(node: Shift.Node, parent?: Shift.Node): any;
}

/**
 * 
 * @param node The Shift AST or node.
 * @param visitor The visitor object.
 * @param parent The parent node (optional, only used internally).
 */
export function traverse(node: Shift.Node | RefactorSessionChainable, visitor: TraversalVisitor, parent?: Shift.Node): void {
    if (node instanceof RefactorSessionChainable) {
        var script = node.$('*[type=/Script|Module/]').raw();
        if (!script) {
            throw new Error('Failed to find a Script or Module.');
        }
        return traverse(script, visitor);
    }
    
    visitor.enter(node, parent);

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
                        traverse(e, visitor, node);
                    }
                });
            } else if (isShiftNode(value)) {
                traverse(value, visitor, node);
            }
        }
    }

    visitor.leave(node, parent);
}
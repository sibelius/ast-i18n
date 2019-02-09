import { JSXText } from '@babel/types';
import { NodePath } from '@babel/traverse';

let phrases: string[] = [];

function BabelPluginI18n() {
  return {
    name: 'i18n',
    visitor: {
      JSXText(path: NodePath<JSXText>) {
        const { node } = path;

        if (node.value) {
          phrases = [
            ...phrases,
            node.value,
          ]
        }
      }
    }
  }
}

BabelPluginI18n.getExtractedStrings = () => phrases;

export default BabelPluginI18n;

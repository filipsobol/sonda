export interface File {
  name: string;
  path: string;
}

export interface Folder {
  name: string;
  path: string;
  items: Array<Content>;
}

export type Content = Folder | File;

export function getTrie( items: Array<string> ): Folder {
  const trie = new FileSystemTrie();

  items.forEach( item => trie.insert( item ) );
  trie.optimize();

  return trie.root;
}

export function isFolder( content: Content ): content is Folder {
  return 'items' in content;
}

export class FileSystemTrie {
  root: Folder;

  constructor() {
    this.root = this.createNode( '', '' ) as Folder;
  }

  private createNode( name: string, path: string ): Folder {
    return {
      name,
      path,
      items: [] as Array<Content>
    };
  }

  insert( filePath: string ): void {
    const parts = filePath.split( '/' );
    const name = parts.pop()!;

    let node: Folder = this.root;

    parts.forEach( part => {
      let childNode = node.items.find( ( item ): item is Folder => isFolder( item ) && item.name === part );

      if ( !childNode ) {
        childNode = this.createNode( part, node.path ? `${ node.path }/${ part }` : part );
        node.items.push( childNode );
      }

      node = childNode;
    } );

    node.items.push( { name , path: filePath } );
  }

  optimize(): void {
    const stack: Array<Folder> = [ this.root ];

    while ( stack.length ) {
      const node = stack.pop()!;

      // Collapse folders with a single child folder
      while ( node.items.length === 1 && isFolder( node.items[ 0 ] ) ) {
        const child = node.items[ 0 ];

        node.path = child.path;
        node.name = child.name;
        node.items = child.items;
      }

      // Repeat for child folders
      node.items.forEach( item => isFolder( item ) && stack.push( item ) );
    }
  }
}

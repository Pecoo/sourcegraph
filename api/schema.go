// GENERATED from sourcegraph.schema - DO NOT EDIT

package api

var Schema = `schema {
	query: Query
}

interface Node {
	id: ID!
}

type Query {
	root: Root!
	node(id: ID!): Node
}

type Root {
	repository(uri: String!): Repository
	remoteRepositories: [RemoteRepository!]!
	remoteStarredRepositories: [RemoteRepository!]!
}

type RefFields {
	refLocation: RefLocation
	uri: URI
}

type URI {
	host: String!
	fragment: String!
	path: String!
	query: String!
	scheme: String!
}

type RefLocation {
	startLineNumber: Int!
	startColumn: Int!
	endLineNumber: Int!
	endColumn: Int!
}

type Repository implements Node {
	id: ID!
	uri: String!
	description: String!
	commit(rev: String!): CommitState!
	latest: CommitState!
	defaultBranch: String!
	branches: [String!]!
	tags: [String!]!
}

type CommitState {
	commit: Commit
	cloneInProgress: Boolean!
}

type Commit implements Node {
	id: ID!
	sha1: String!
	tree(path: String = "", recursive: Boolean = false): Tree
	file(path: String!): File
	languages: [String!]!
}

type CommitInfo {
	rev: String!
	author: Signature
	committer: Signature
	message: String!
}

type Signature {
	person: Person
	date: String!
}

type Person {
	name:  String!
	email: String!
	gravatarHash: String!
}

type Tree {
	directories: [Directory]!
	files: [File]!
}

type Directory {
	name: String!
	tree: Tree!
}

type File {
	name: String!
	content: String!
	blame(startLine: Int!, endLine: Int!): [Hunk!]!
	commits: [CommitInfo!]!
	definition(line: Int!, column: Int!, language: String!): Definition
}

type Definition {
   globalReferences: [RefFields!]!
}

type RemoteRepository {
	uri: String!
	description: String!
	language: String!
	fork: Boolean!
	private: Boolean!
	createdAt: String!
	pushedAt: String!
}

type Hunk {
	startLine: Int!
	endLine: Int!
	startByte: Int!
	endByte: Int!
	rev: String!
	author: Signature
	message: String!
}
`

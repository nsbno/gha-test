interface InfrastructureExecutor {
  planInfrastructure(directoryToCheck: string): Promise<boolean> // returns true if there are changes
}

export { InfrastructureExecutor }

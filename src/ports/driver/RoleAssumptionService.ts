interface IRoleAssumptionService {
  assumeRole(
    accountId: string,
    roleName: string,
    sessionName: string
  ): Promise<void>
}

export { IRoleAssumptionService }

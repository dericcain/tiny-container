import Container from '../src';

class MockDep {}

class MockService {
  mockDep: any;

  constructor({ mockDep }: any) {
    this.mockDep = mockDep;
  }
}

describe('IoC Container', () => {
  it('should add a dependency to the services property', () => {
    const container = new Container();
    container.register('mockDep', MockDep);
    container.register('mockService', MockService, ['mockDep']);
    const mockService = container.get('mockService');
    expect(mockService.mockDep).toBeInstanceOf(MockDep);
  });

  it('should create a new instance each time', () => {
    const container = new Container();
    container.register('mockService', MockService);
    const serviceA = container.get('mockService');
    const serviceB = container.get('mockService');
    expect(serviceA).not.toBe(serviceB);
  });

  it('should create a singleton', () => {
    const container = new Container();
    container.singleton('mockService', MockService);
    const serviceA = container.get('mockService');
    const serviceB = container.get('mockService');
    expect(serviceA).toBe(serviceB);
  });

  it('should should instantiate dependencies as a singleton', () => {
    const container = new Container();
    container.singleton('mockDep', MockDep);
    container.register('mockService', MockService, ['mockDep']);
    const serviceA = container.get('mockService');
    const serviceB = container.get('mockService');
    expect(serviceA.mockDep).toBe(serviceB.mockDep);
  });
});

import { Container } from '../src';

class MockDep {}

class MockService {
  mockDep: any;
  additionalDep: any;

  constructor({ mockDep, additionalDep }: any) {
    this.mockDep = mockDep;
    this.additionalDep = additionalDep;
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

  it('should allow dependencies to be passed into the "get" method', () => {
    const additionalDep = {};
    const container = new Container();
    container.register('mockService', MockService);
    const service = container.get('mockService', { additionalDep });
    expect(service.additionalDep).toBe(additionalDep);
  });

  it('should throw if an unknown service is attempted to be retrieved', () => {
    const container = new Container();
    expect(() => container.get('something')).toThrow();
  });
});

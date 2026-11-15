import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateLeaseDto } from './create-lease.dto';

const valid = {
  email: '  tenant1@aparts.dev ',
  phone: ' 050-100-0001 ',
  startDate: '2026-01-01',
  endDate: '2027-01-01',
  monthlyRent: 5200,
};

/** Runs the DTO the way the global ValidationPipe does and returns the names of the invalid fields. */
async function invalidFields(body: object): Promise<string[]> {
  const errors = await validate(plainToInstance(CreateLeaseDto, body), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((e) => e.property);
}

describe('CreateLeaseDto', () => {
  it('accepts a valid body and trims the email and phone', async () => {
    const dto = plainToInstance(CreateLeaseDto, valid);
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.email).toBe('tenant1@aparts.dev');
    expect(dto.phone).toBe('050-100-0001');
  });

  it.each([
    ['an end date before the start date', { endDate: '2025-12-31' }, 'endDate'],
    ['an end date equal to the start date', { endDate: '2026-01-01' }, 'endDate'],
    ['a date that does not exist', { startDate: '2026-02-31' }, 'startDate'],
    ['a date with a time', { startDate: '2026-01-01T00:00:00Z' }, 'startDate'],
    ['a date that is not a string', { endDate: 20270101 }, 'endDate'],
    ['a missing date', { startDate: undefined }, 'startDate'],
    ['an invalid email', { email: 'not-an-email' }, 'email'],
    ['a blank phone', { phone: '   ' }, 'phone'],
    ['a rent of zero', { monthlyRent: 0 }, 'monthlyRent'],
    ['a rent with 3 decimals', { monthlyRent: 10.999 }, 'monthlyRent'],
    ['a rent sent as a string', { monthlyRent: '5200' }, 'monthlyRent'],
  ])('rejects %s', async (_, override, field) => {
    expect(await invalidFields({ ...valid, ...override })).toContain(field);
  });

  it.each(['status', 'tenantId', 'unitId'])('rejects a body that sets %s', async (field) => {
    expect(await invalidFields({ ...valid, [field]: 'x' })).toContain(field);
  });
});

export class CreateEventDto {
  title: string;
  date: string;
  hour: string;
  address: string;
  locationName?: string;
  description?: string;

  guests: string[];
}

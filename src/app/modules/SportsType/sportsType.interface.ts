export interface ISportsType {
  sportName: string;
  sportsImage: string;
}

export interface ISportsTypeUpdate {
  sportName?: string;
  sportsImage?: string;
}

export interface ISportsTypeResponse {
  id: string;
  sportName: string;
  sportsImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISportsTypeFilterRequest {
  searchTerm?: string;
  sportName?: string;
}

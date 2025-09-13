declare global {
  interface ServiceRecords {
    Records: ServiceRecord[]
  }
  
  // Type for a single record in the "records" array
  interface ServiceRecord {
    id: string;
    TagID: string;
    EnteredDate: string | null;
    ServicedDate: string;
    MechanicName: string;
    Odometer: string;
    ServiceType: string;
    Comment: string;
    FileUrls: string[];
    // CompletedTasks: TaskCompleted[];
    // PendingCompletedTasks: PendingTaskCompleted[] | null;
    Certified?: boolean;
  }
  
  interface TaskCompleted
  {
    Task: string;
    Comment: string;
    Receipts: string[];
  }

  interface PendingTaskCompleted
  {
    Task: string;
    Comment: string;
    Receipts: File[];
  }


  interface Task {
    Task: string,
    Comment: string
  }

  // Type for the outer object containing "EnteredDate" and "records"
  interface ServiceLog {
    EnteredDate: string;
    records: ServiceRecord[];
  }

  type ServiceLogs = ServiceLog[];


  interface ServiceTag {
    Make: string;
    Model: string;
    Year: number;
    Vehicle: string;
    Style: string;
    Engine: number;
    Fuel: string;
    Transmission: string;
    Color: string;
    VinNumber: string | null;
    LicencePlate: string | null;
  }

  type ServiceTags = ServiceTag[];

  interface ServiceUser {
    ID: string;
    Name: string;
    Password: string;
    Email: string;
    Location: string;
    Certified: boolean;
  }




  // Type for a single record in the "records" array
interface Recent {
    ID: string;
    Make: string;
    Model: string;
    Year: number;
    ServicedDate: string;
    ServicedByName: string;
    ServiceType: string;
    ServiceComment: string;
  }
  
  type RecentLogs = Recent[];
}

export interface TaskOption {
  readonly value: string;
  readonly label: string;
}

interface StateOption {
  readonly value: string;
  readonly label: string;
}

export interface GroupedOption {
  readonly label: string;
  readonly options: readonly TaskOption[];
}


export interface SortOption {
  readonly label: string;
  readonly options: readonly TaskOption[];
}



export {};

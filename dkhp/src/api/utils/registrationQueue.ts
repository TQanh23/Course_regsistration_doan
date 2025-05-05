interface QueueItem<T> {
  id: string;
  priority: number;
  timestamp: number;
  data: T;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

interface QueueOptions {
  maxConcurrent?: number;
  processingTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

class RegistrationQueue {
  private static instance: RegistrationQueue;
  private queue: QueueItem<any>[];
  private processing: Set<string>;
  private maxConcurrent: number;
  private processingTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private isProcessing: boolean;

  private constructor(options: QueueOptions = {}) {
    this.queue = [];
    this.processing = new Set();
    this.maxConcurrent = options.maxConcurrent || 5;
    this.processingTimeout = options.processingTimeout || 30000; // 30 seconds
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // 1 second
    this.isProcessing = false;
  }

  public static getInstance(options?: QueueOptions): RegistrationQueue {
    if (!RegistrationQueue.instance) {
      RegistrationQueue.instance = new RegistrationQueue(options);
    }
    return RegistrationQueue.instance;
  }

  public enqueue<T>(
    data: T,
    priority: number = 1,
    processor: (data: T) => Promise<any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const item: QueueItem<T> = {
        id: crypto.randomUUID(),
        priority,
        timestamp: Date.now(),
        data,
        resolve,
        reject
      };

      this.insertWithPriority(item);
      this.processQueue(processor);
    });
  }

  private insertWithPriority<T>(item: QueueItem<T>): void {
    const index = this.queue.findIndex(
      existing => existing.priority < item.priority ||
        (existing.priority === item.priority && existing.timestamp > item.timestamp)
    );

    if (index === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(index, 0, item);
    }
  }

  private async processQueue<T>(processor: (data: T) => Promise<any>): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.processing.size < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) continue;

      this.processing.add(item.id);
      this.processItem(item, processor)
        .finally(() => {
          this.processing.delete(item.id);
          if (this.queue.length > 0) {
            this.processQueue(processor);
          } else if (this.processing.size === 0) {
            this.isProcessing = false;
          }
        });
    }

    if (this.processing.size === 0) {
      this.isProcessing = false;
    }
  }

  private async processItem<T>(
    item: QueueItem<T>,
    processor: (data: T) => Promise<any>,
    attempt: number = 1
  ): Promise<void> {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout')), this.processingTimeout);
      });

      const result = await Promise.race([
        processor(item.data),
        timeoutPromise
      ]);

      item.resolve(result);
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.processItem(item, processor, attempt + 1);
      } else {
        item.reject(error);
      }
    }
  }

  public getQueueStatus(): {
    queueLength: number;
    processing: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      isProcessing: this.isProcessing
    };
  }

  public clearQueue(): void {
    this.queue = [];
  }

  public updateOptions(options: Partial<QueueOptions>): void {
    if (options.maxConcurrent) this.maxConcurrent = options.maxConcurrent;
    if (options.processingTimeout) this.processingTimeout = options.processingTimeout;
    if (options.retryAttempts) this.retryAttempts = options.retryAttempts;
    if (options.retryDelay) this.retryDelay = options.retryDelay;
  }
}
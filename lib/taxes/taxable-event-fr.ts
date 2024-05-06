export interface TaxableEventFr {
  /** Symbol of the stock */
  symbol: string;
  planType: "ESPP" | "RS" | "SO";
  /** What kind of qualified plan is it? */
  qualifiedIn: "fr" | "us";
  /** Taxable event type */
  type: "vesting" | "sell" | "exercise";
  /**
   * Date of the taxable event.
   * In format YYYY-MM-DD
   */
  date: string;
  /** Number of shares */
  quantity: number;
  /**
   * Sell information (per share).
   * If the taxable event is about a non qualified vesting, this field is null.
   */
  sell: { usd: number; rate: number; eur: number; date: string } | null;
  /** Acquisition information (per share) */
  acquisition: {
    /** Value of the share at acquistion in USD */
    valueUsd: number;
    /** Value of the share at acquistion in EUR */
    valueEur: number;
    /** Acquisition cost in USD */
    costUsd: number;
    /** Acquisition cost in EUR */
    costEur: number;
    /** Symbol price at opening price on time of exercise. */
    symbolPrice: number;
    /** Symbol price at opening price on time of exercise (in EUR). */
    symbolPriceEur: number;
    /** USD rate at time of acquisition */
    rate: number;
    /**
     * Acquisition date
     * In format YYYY-MM-DD
     */
    date: string;
    /**
     * Describe how the acquisition cost was calculated.
     * Examples:
     * - DDOG price at opening price on time of exercise.
     * - DDOG price at opening price on time of vesting.
     * - Sell price as the plan is qualified and the sale is at loss.
     * - Sell price as this is a sell to cover.
     * - DDOG price at opening price on time of vesting since the plan is not qualified.
     * - DDOG price at opening price on time of exercise since the plan is not qualified.
     */
    description: string;
  };
  /** Computed capital gain for this taxable event */
  capitalGain: { perShare: number; total: number };
  /** Computed acquisition gain for this taxable event */
  acquisitionGain: {
    perShare: number;
    total: number;
  };
}

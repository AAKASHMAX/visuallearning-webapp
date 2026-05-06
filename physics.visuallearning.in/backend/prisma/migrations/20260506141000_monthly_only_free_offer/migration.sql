UPDATE "SubscriptionPlan"
SET "freeOfferEnabled" = false,
    "freeOfferUntil" = NULL
WHERE "code" LIKE '%\_YEARLY' ESCAPE '\'
   OR "durationDays" >= 365;

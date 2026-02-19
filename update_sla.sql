UPDATE tickets SET "slaDeadline" = "createdAt" + INTERVAL '4 hours' WHERE priority = 'critical';
UPDATE tickets SET "slaDeadline" = "createdAt" + INTERVAL '24 hours' WHERE priority = 'high';
UPDATE tickets SET "slaDeadline" = "createdAt" + INTERVAL '48 hours' WHERE priority = 'medium';
UPDATE tickets SET "slaDeadline" = "createdAt" + INTERVAL '72 hours' WHERE priority = 'low';
SELECT "ticketNumber", priority, "slaDeadline" FROM tickets LIMIT 5;

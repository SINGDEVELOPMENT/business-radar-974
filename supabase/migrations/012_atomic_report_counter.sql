CREATE OR REPLACE FUNCTION increment_report_counter(
  org_id UUID,
  max_limit INT,
  current_month_start TIMESTAMPTZ
)
RETURNS INT AS $$
DECLARE
  current_count INT;
BEGIN
  -- Reset if new month, then increment atomically
  UPDATE organizations
  SET
    manual_reports_this_month = CASE
      WHEN manual_reports_reset_at IS NULL
        OR date_trunc('month', manual_reports_reset_at) < date_trunc('month', current_month_start)
      THEN 1
      ELSE manual_reports_this_month + 1
    END,
    manual_reports_reset_at = current_month_start
  WHERE id = org_id
    AND (
      -- New month: always allow (reset to 1)
      manual_reports_reset_at IS NULL
      OR date_trunc('month', manual_reports_reset_at) < date_trunc('month', current_month_start)
      -- Same month: check limit
      OR manual_reports_this_month < max_limit
    )
  RETURNING manual_reports_this_month INTO current_count;

  -- Returns NULL if limit reached (0 rows updated)
  RETURN current_count;
END;
$$ LANGUAGE plpgsql;

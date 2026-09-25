-- Atomic balance changes for the dashboard BTC/USDT swap.
-- USDT is intentionally held in the browser per the product requirement.
CREATE OR REPLACE FUNCTION swap_btc_to_usdt(p_btc_price NUMERIC)
RETURNS TABLE (btc_amount NUMERIC, usdt_amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_row profiles%ROWTYPE;
BEGIN
  IF p_btc_price IS NULL OR p_btc_price <= 0 THEN
    RAISE EXCEPTION 'A valid BTC price is required';
  END IF;

  SELECT * INTO profile_row
  FROM profiles
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF profile_row.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  btc_amount := COALESCE(profile_row.btc_balance, 0);
  usdt_amount := btc_amount * p_btc_price;

  UPDATE profiles
  SET btc_balance = 0
  WHERE id = profile_row.id;

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION swap_usdt_to_btc(p_usdt_amount NUMERIC, p_btc_price NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_id UUID;
  btc_amount NUMERIC;
BEGIN
  IF p_usdt_amount IS NULL OR p_usdt_amount <= 0 OR p_btc_price IS NULL OR p_btc_price <= 0 THEN
    RAISE EXCEPTION 'A valid amount and BTC price are required';
  END IF;

  SELECT id INTO profile_id FROM profiles WHERE user_id = auth.uid() FOR UPDATE;
  IF profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  btc_amount := p_usdt_amount / p_btc_price;
  UPDATE profiles SET btc_balance = btc_amount WHERE id = profile_id;
  RETURN btc_amount;
END;
$$;

REVOKE ALL ON FUNCTION swap_btc_to_usdt(NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION swap_usdt_to_btc(NUMERIC, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION swap_btc_to_usdt(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION swap_usdt_to_btc(NUMERIC, NUMERIC) TO authenticated;
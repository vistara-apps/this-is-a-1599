-- LiquidityPulse Database Schema
-- Initial migration to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'institutional')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'active',
    usage_api_calls INTEGER DEFAULT 0,
    usage_alerts INTEGER DEFAULT 0,
    usage_pairs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading pairs table
CREATE TABLE trading_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair_id VARCHAR(100) UNIQUE NOT NULL,
    base_token VARCHAR(100) NOT NULL,
    quote_token VARCHAR(100) NOT NULL,
    base_token_address VARCHAR(42),
    quote_token_address VARCHAR(42),
    source_exchanges TEXT[], -- Array of exchange names
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liquidity data table
CREATE TABLE liquidity_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_id VARCHAR(100) UNIQUE NOT NULL,
    pair_id UUID REFERENCES trading_pairs(id) ON DELETE CASCADE,
    exchange VARCHAR(100) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    depth DECIMAL(20, 8) NOT NULL,
    volume_24h DECIMAL(20, 8),
    liquidity_usd DECIMAL(20, 8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slippage predictions table
CREATE TABLE slippage_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id VARCHAR(100) UNIQUE NOT NULL,
    pair_id UUID REFERENCES trading_pairs(id) ON DELETE CASCADE,
    exchange VARCHAR(100) NOT NULL,
    trade_size DECIMAL(20, 8) NOT NULL,
    predicted_slippage DECIMAL(8, 4) NOT NULL,
    confidence_level DECIMAL(5, 2),
    price_impact DECIMAL(8, 4),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    recommendation TEXT,
    factors TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    pair_id UUID REFERENCES trading_pairs(id) ON DELETE CASCADE,
    details JSONB,
    threshold_value DECIMAL(20, 8),
    current_value DECIMAL(20, 8),
    is_triggered BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    notification_methods TEXT[] DEFAULT ARRAY['in_app'],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert history table for tracking triggered alerts
CREATE TABLE alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    details JSONB,
    severity VARCHAR(20),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pool balances table for real-time monitoring
CREATE TABLE pool_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair_id UUID REFERENCES trading_pairs(id) ON DELETE CASCADE,
    exchange VARCHAR(100) NOT NULL,
    token0_balance DECIMAL(30, 18) NOT NULL,
    token1_balance DECIMAL(30, 18) NOT NULL,
    token0_symbol VARCHAR(20),
    token1_symbol VARCHAR(20),
    pool_address VARCHAR(42),
    total_liquidity_usd DECIMAL(20, 8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market events table for tracking significant events
CREATE TABLE market_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    pair_id UUID REFERENCES trading_pairs(id) ON DELETE CASCADE,
    exchange VARCHAR(100),
    event_data JSONB,
    impact_score DECIMAL(5, 2), -- 0-100 scale
    severity VARCHAR(20) DEFAULT 'medium',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT true,
    notification_in_app BOOLEAN DEFAULT true,
    default_slippage_tolerance DECIMAL(5, 2) DEFAULT 0.5,
    preferred_exchanges TEXT[],
    favorite_pairs TEXT[],
    theme VARCHAR(20) DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking table
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

CREATE INDEX idx_trading_pairs_pair_id ON trading_pairs(pair_id);
CREATE INDEX idx_trading_pairs_tokens ON trading_pairs(base_token, quote_token);
CREATE INDEX idx_trading_pairs_active ON trading_pairs(is_active);

CREATE INDEX idx_liquidity_data_pair_id ON liquidity_data(pair_id);
CREATE INDEX idx_liquidity_data_exchange ON liquidity_data(exchange);
CREATE INDEX idx_liquidity_data_timestamp ON liquidity_data(timestamp DESC);
CREATE INDEX idx_liquidity_data_pair_exchange ON liquidity_data(pair_id, exchange);

CREATE INDEX idx_slippage_predictions_pair_id ON slippage_predictions(pair_id);
CREATE INDEX idx_slippage_predictions_exchange ON slippage_predictions(exchange);
CREATE INDEX idx_slippage_predictions_timestamp ON slippage_predictions(timestamp DESC);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_pair_id ON alerts(pair_id);
CREATE INDEX idx_alerts_active ON alerts(is_active);
CREATE INDEX idx_alerts_triggered ON alerts(is_triggered);
CREATE INDEX idx_alerts_event_type ON alerts(event_type);

CREATE INDEX idx_alert_history_user_id ON alert_history(user_id);
CREATE INDEX idx_alert_history_triggered_at ON alert_history(triggered_at DESC);

CREATE INDEX idx_pool_balances_pair_id ON pool_balances(pair_id);
CREATE INDEX idx_pool_balances_exchange ON pool_balances(exchange);
CREATE INDEX idx_pool_balances_timestamp ON pool_balances(timestamp DESC);

CREATE INDEX idx_market_events_pair_id ON market_events(pair_id);
CREATE INDEX idx_market_events_timestamp ON market_events(timestamp DESC);
CREATE INDEX idx_market_events_severity ON market_events(severity);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_date ON api_usage(date);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_pairs_updated_at BEFORE UPDATE ON trading_pairs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own alerts
CREATE POLICY "Users can view own alerts" ON alerts
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own alert history
CREATE POLICY "Users can view own alert history" ON alert_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own API usage
CREATE POLICY "Users can view own API usage" ON api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Insert default trading pairs
INSERT INTO trading_pairs (pair_id, base_token, quote_token, base_token_address, quote_token_address, source_exchanges) VALUES
('WETH-USDC', 'WETH', 'USDC', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xA0b86a33E6417c8f2B8B8B8B8B8B8B8B8B8B8B8B', ARRAY['uniswap', 'sushiswap', 'curve']),
('WBTC-USDT', 'WBTC', 'USDT', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '0xdAC17F958D2ee523a2206206994597C13D831ec7', ARRAY['uniswap', 'sushiswap']),
('UNI-WETH', 'UNI', 'WETH', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', ARRAY['uniswap', 'sushiswap']),
('LINK-USDC', 'LINK', 'USDC', '0x514910771AF9Ca656af840dff83E8264EcF986CA', '0xA0b86a33E6417c8f2B8B8B8B8B8B8B8B8B8B8B8B', ARRAY['uniswap', 'curve']),
('AAVE-WETH', 'AAVE', 'WETH', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', ARRAY['uniswap', 'sushiswap']);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts and subscription information';
COMMENT ON TABLE trading_pairs IS 'Available trading pairs across exchanges';
COMMENT ON TABLE liquidity_data IS 'Real-time liquidity data from various exchanges';
COMMENT ON TABLE slippage_predictions IS 'AI-generated slippage predictions';
COMMENT ON TABLE alerts IS 'User-configured alerts for market events';
COMMENT ON TABLE alert_history IS 'Historical record of triggered alerts';
COMMENT ON TABLE pool_balances IS 'Real-time pool balance monitoring';
COMMENT ON TABLE market_events IS 'Significant market events and changes';
COMMENT ON TABLE user_preferences IS 'User preferences and settings';
COMMENT ON TABLE api_usage IS 'API usage tracking for rate limiting and analytics';

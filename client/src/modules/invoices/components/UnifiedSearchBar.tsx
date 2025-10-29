import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { Search as SearchIcon, SmartToy as AIIcon, Clear as ClearIcon } from '@mui/icons-material';

interface UnifiedSearchBarProps {
  onSearch: (query: string) => void;
  onAiSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
}

const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  onSearch,
  onAiSearch,
  placeholder = 'Search by vendor/customer',
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleClear = () => {
    setQuery('');
  };

  const handleAiSearch = () => {
    if (query) {
      onAiSearch(query);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch(query); // Trigger search immediately on Enter
    }
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            {query && (
              <IconButton onClick={handleClear} size="small" aria-label="clear search">
                <ClearIcon />
              </IconButton>
            )}
            <Tooltip title="Ask AI Assistant">
              <IconButton
                onClick={handleAiSearch}
                color="primary"
                disabled={!query}
                aria-label="ask ai assistant">
                <AIIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default UnifiedSearchBar;

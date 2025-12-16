# Debug Mode Documentation

## Running in Debug Mode

### Windows
```bash
run_debug.bat
```

### Linux/Mac
```bash
chmod +x run_debug.sh
./run_debug.sh
```

### Manual
```bash
python app_debug.py
```

## Debug Features

### 1. Enhanced Logging
- All requests and responses are logged
- Detailed timing information for each analysis
- Error tracking with full stack traces
- Logs saved to `debug.log`

### 2. Additional Endpoints

**Health Check with Debug Info**
```
GET /api/health
```
Returns:
- API configuration status
- ML model loading status
- Current timestamp
- Debug mode indicator

**View Recent Logs**
```
GET /api/logs
```
Returns last 100 log entries

### 3. Debug Information in Response

Each analysis response includes:
```json
{
  "ml_analysis": {...},
  "ai_analysis": {...},
  "detected_language": "Python",
  "debug_info": {
    "total_duration": "3.45s",
    "ml_duration": "1.23s",
    "ai_duration": "2.22s",
    "timestamp": "2024-12-16T10:30:45.123456"
  }
}
```

### 4. Error Handling

- Detailed error messages
- Full stack traces in responses
- Automatic error logging
- Graceful fallbacks

## Log File Format

```
2024-12-16 10:30:45,123 - __main__ - INFO - NEW ANALYSIS REQUEST
2024-12-16 10:30:45,124 - __main__ - DEBUG - Code length: 150 characters
2024-12-16 10:30:45,125 - __main__ - INFO - Auto-detected language: python
2024-12-16 10:30:45,126 - __main__ - INFO - Starting ML model analysis...
2024-12-16 10:30:46,234 - __main__ - INFO - ML analysis completed in 1.11s
2024-12-16 10:30:46,235 - __main__ - INFO - Starting Gemini AI analysis...
2024-12-16 10:30:48,456 - __main__ - INFO - AI analysis completed in 2.22s
2024-12-16 10:30:48,457 - __main__ - INFO - Total analysis completed in 3.33s
```

## Monitoring

### Real-time Log Monitoring

**Windows:**
```bash
powershell Get-Content debug.log -Wait -Tail 50
```

**Linux/Mac:**
```bash
tail -f debug.log
```

### Log Analysis

Search for errors:
```bash
grep "ERROR" debug.log
```

Search for specific analysis:
```bash
grep "Auto-detected language" debug.log
```

## Performance Profiling

The debug mode tracks:
- Total request duration
- ML model analysis time
- AI analysis time
- Language detection time

Use this data to:
- Identify bottlenecks
- Optimize slow operations
- Monitor API response times

## Troubleshooting

### Common Issues

**1. ML Model Not Loading**
Check logs for:
```
ERROR - Failed to load ML model
```

**2. Gemini API Errors**
Check logs for:
```
ERROR - Gemini AI Error
```

**3. Language Detection Issues**
Check logs for:
```
INFO - Auto-detected language: [language]
```

### Debug Checklist

- [ ] Check `debug.log` for errors
- [ ] Verify API key in `.env`
- [ ] Confirm ML model downloaded
- [ ] Test `/api/health` endpoint
- [ ] Review timing information
- [ ] Check network connectivity

## Production vs Debug

| Feature | Production | Debug |
|---------|-----------|-------|
| Logging Level | INFO | DEBUG |
| Error Details | Minimal | Full Stack Trace |
| Performance Tracking | No | Yes |
| Log File | No | Yes |
| Debug Endpoints | No | Yes |

## Best Practices

1. **Always use debug mode during development**
2. **Review logs after each test**
3. **Monitor performance metrics**
4. **Check for memory leaks**
5. **Test error scenarios**
6. **Validate API responses**

## Security Note

⚠️ **Never use debug mode in production!**

Debug mode exposes:
- Detailed error messages
- Stack traces
- Internal system information
- Performance metrics

Always use `app.py` for production deployment.

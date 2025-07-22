# Troubleshooting

Common issues, solutions, and debugging tips for Triple-Crown.

## 🚨 Quick Fixes (Try These First)

### The "90% Solution" Checklist

Most Triple-Crown issues are resolved by these steps:

1. **🔄 Restart Obsidian** (fixes plugin loading issues)
2. **🔑 Check API key** in settings (verify it's correct and active)
3. **🌐 Test internet connection** (Claude requires online access)
4. **🔍 Check console** (F12 → Console for error messages)
5. **⚙️ Verify action is enabled** in plugin settings

If none of these work, continue to specific issue sections below.

## 🔧 Installation & Setup Issues

### Plugin Won't Install

**Symptoms:**
- Plugin folder not recognized
- Obsidian doesn't show Triple-Crown in plugin list
- "Failed to load plugin" error

**Solutions:**

**1. Verify File Structure**
```
vault/.obsidian/plugins/triple-crown/
├── main.js           ✅ Required
├── manifest.json     ✅ Required  
├── styles.css        ✅ Required
└── versions.json     ✅ Required
```

**2. Check File Permissions**
- Ensure files are readable
- On macOS/Linux: `chmod 644 vault/.obsidian/plugins/triple-crown/*`

**3. Verify Obsidian Version**
- Triple-Crown requires Obsidian 0.15.0+
- Check: Settings → About → Current version

**4. Clear Plugin Cache**
- Close Obsidian completely
- Delete `vault/.obsidian/workspace.json`
- Restart Obsidian

### Plugin Won't Enable

**Symptoms:**
- Plugin appears in list but toggle is grayed out
- Toggle turns on but immediately turns off
- Error message when trying to enable

**Solutions:**

**1. Check Console Errors**
- Press F12 → Console tab
- Look for red error messages mentioning "triple-crown"
- Common errors and solutions:

```javascript
// Error: Cannot read property 'requestUrl' of undefined
// Solution: Update Obsidian (requestUrl added in 0.15.0)

// Error: Failed to load main.js
// Solution: Re-download plugin files, check file integrity

// Error: Manifest version mismatch  
// Solution: Ensure manifest.json matches plugin version
```

**2. Plugin Conflicts**
- Disable other plugins temporarily
- Re-enable Triple-Crown
- If successful, re-enable other plugins one by one

**3. Settings File Corruption**
- Close Obsidian
- Delete `vault/.obsidian/plugins/triple-crown/data.json`
- Restart Obsidian and reconfigure

## 🔑 API Connection Issues

### API Key Problems

**Symptoms:**
- "Invalid API key" errors
- 401 Authentication errors
- Actions fail immediately

**Solutions:**

**1. Verify API Key Format**
- Must start with `sk-ant-`
- Should be 100+ characters long
- No spaces or extra characters

**2. Test API Key**
- Visit [Anthropic Console](https://console.anthropic.com)
- Verify key is active and has usage credits
- Check rate limits and billing status

**3. Common API Key Mistakes**
```
❌ Bad: "sk-ant-api03000000000000000000000000000000000000"
✅ Good: "sk-ant-api03000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

❌ Bad: Copy-pasted with extra spaces
✅ Good: Exact key string with no modifications
```

### Network & Endpoint Issues

**Symptoms:**
- "Network request failed" errors
- Timeouts
- "Cannot connect to API" messages

**Solutions:**

**1. Check Internet Connection**
- Test with browser: visit [anthropic.com](https://anthropic.com)
- Try different network (mobile hotspot, etc.)
- Check firewall/corporate proxy settings

**2. Verify API Endpoint**
- Default: `https://api.anthropic.com/v1/messages`
- Only change if using corporate proxy
- Must include `https://` and `/v1/messages`

**3. Corporate Network Issues**
```json
// If behind corporate firewall:
{
  "apiEndpoint": "https://your-proxy.company.com/claude/v1/messages",
  "requestTimeout": 60000
}
```

**4. DNS/Proxy Issues**
- Try different DNS servers (8.8.8.8, 1.1.1.1)
- Disable VPN temporarily
- Check corporate proxy configuration

## 🎯 Action-Specific Issues

### Actions Not Appearing in Command Palette

**Symptoms:**
- Cannot find action commands (e.g., "Generate Tags")
- Command Palette doesn't show Triple-Crown actions
- Custom actions missing after creation

**Solutions:**

**1. Check Action Enable Status**
- Settings → Triple-Crown → Actions
- Ensure desired actions are toggled ON
- Custom actions require plugin restart

**2. Restart After Custom Actions**
- Creating custom actions requires Obsidian restart
- Close Obsidian completely, reopen
- Check Command Palette again

**3. Command Palette Cache**
- Clear command palette cache: Ctrl/Cmd+P → type "reload"
- Select "Reload app without saving"

### Actions Fail or Return Poor Results

**Symptoms:**
- Actions complete but results are irrelevant
- Error messages during action execution
- Actions take very long time

**Solutions:**

**1. Check Selection Requirements**
| Action | Selection Required | Notes |
|--------|-------------------|-------|
| Writing Assistant | Optional | Works on selection or whole doc |
| Tag Builder | No | Analyzes entire document |
| Connection Finder | No | Scans whole document and vault |
| Code Reviewer | Yes | Must select code block |
| Therapist Mode | No | Works on whole document |
| Peer Reviewer | No | Analyzes entire document |

**2. Improve Input Quality**
```
❌ Bad input: 
"asdf jkl; random text here no structure"

✅ Good input:
"This is a well-structured paragraph about machine learning 
concepts that provides clear context for analysis."
```

**3. Context Issues**
- Very large documents may hit API limits
- Try selecting specific sections instead
- Check context size in settings

**4. Model Selection**
```json
// For faster results, try Haiku:
"modelName": "claude-3-5-haiku-20241022"

// For better quality, try Sonnet:  
"modelName": "claude-3-5-sonnet-20241022"
```

### Therapist Mode Issues

**Symptoms:**
- "Therapist Mode" not in Command Palette
- Action runs but provides generic responses
- Privacy concerns about personal content

**Solutions:**

**1. Enable Therapist Mode**
- It's disabled by default for privacy
- Settings → Triple-Crown → Actions → Toggle "Therapist Mode" ON
- Confirm you understand privacy implications

**2. Improve Personal Writing**
```
❌ Generic: "Things are okay I guess"

✅ Specific: "I've been feeling overwhelmed at work this week. 
The new project deadline is causing anxiety and I'm having 
trouble prioritizing my tasks effectively."
```

**3. Privacy Considerations**
- Only use in private vaults
- Avoid real names and identifying information
- Consider using `.claude/config.json` to restrict access

## 🔐 Privacy & Security Issues

### Privacy Violations

**Symptoms:**
- Sensitive files being shared with Claude
- Privacy patterns not working
- Confirmation prompts not appearing

**Solutions:**

**1. Check Never-Share Patterns**
```json
{
  "neverSharePatterns": [
    "*.key", "*.pem", "*.cert",
    "*password*", "*secret*", "*token*",
    "*personal*", "*confidential*"
  ]
}
```

**2. Verify Folder Configuration**
```json
// In sensitive folders, create .claude/config.json:
{
  "permissions": {
    "scope": "disabled",
    "reason": "Contains sensitive information"
  },
  "privacy": {
    "neverShare": ["**/*"],
    "blockAllAccess": true
  }
}
```

**3. Enable Confirmation Requirements**
- Settings → Triple-Crown → Privacy → "Require confirmation" ON
- This shows preview before sharing content

### Vault Boundary Issues

**Symptoms:**
- Concerns about file access outside vault
- Unclear what Triple-Crown can access

**Clarification:**

**✅ Triple-Crown CAN Access:**
- Files within your Obsidian vault only
- File names and structure within vault
- Content of files you explicitly use actions on

**❌ Triple-Crown CANNOT Access:**
- Files outside your vault directory  
- System files or personal directories
- Other applications or browser data
- Files in excluded folders (.obsidian, hidden files)

## 🐛 Performance Issues

### Slow Response Times

**Symptoms:**
- Actions take 30+ seconds
- Terminal responses very slow
- Obsidian freezes during action execution

**Solutions:**

**1. Reduce Context Size**
```json
{
  "contextSettings": {
    "maxFileSize": 20000,     // Reduce from 50000
    "maxContextFiles": 3,     // Reduce from 5
    "maxContextSize": 5000    // Reduce from 10000
  }
}
```

**2. Use Faster Model**
```json
{
  "modelName": "claude-3-5-haiku-20241022"  // Much faster than Sonnet/Opus
}
```

**3. Optimize Network**
- Check internet speed and stability
- Try different time of day (API load varies)
- Reduce concurrent requests

**4. Selective Content Processing**
- Select specific paragraphs instead of whole documents
- Break large documents into smaller sections
- Use actions on focused content

### High API Costs

**Symptoms:**
- Unexpectedly high bills from Anthropic
- Rapid token consumption
- Cost alerts from Anthropic Console

**Solutions:**

**1. Monitor Usage**
- Check [Anthropic Console](https://console.anthropic.com) regularly
- Set up billing alerts
- Review usage patterns

**2. Cost Optimization Strategies**
```json
{
  "costOptimization": {
    "preferHaikuModel": true,
    "reduceContextSize": true,
    "limitConcurrentRequests": 1,
    "cacheResponses": true
  }
}
```

**3. Usage Patterns to Avoid**
- Processing entire books/long documents
- Using Opus model for simple tasks
- Running actions on same content repeatedly
- Using actions without clear purpose

## 🔍 Debugging Tools

### Console Debugging

**Access Console:**
- Press F12 (or Cmd+Option+I on Mac)
- Click "Console" tab
- Look for messages mentioning "triple-crown"

**Common Error Messages:**

```javascript
// API Key Issues
"Error: Invalid API key"
→ Check API key in settings

// Network Issues  
"TypeError: Failed to fetch"
→ Check internet connection, firewall

// Plugin Loading Issues
"Error: Cannot read property of undefined"
→ Restart Obsidian, check plugin installation

// Rate Limiting
"Error: 429 Too Many Requests"
→ Wait a few minutes, reduce request frequency
```

### Debug Mode Configuration

Enable detailed logging:

```json
{
  "debug": {
    "enableLogging": true,
    "logLevel": "verbose", 
    "logApiRequests": true,
    "logActionExecution": true,
    "logContextGeneration": true
  }
}
```

### Log Analysis

**Check Plugin Logs:**
1. Enable debug mode (above)
2. Reproduce the issue
3. Check console for detailed logs
4. Look for patterns in error messages

**Log Locations:**
- **Browser Console**: F12 → Console (real-time)
- **Obsidian Logs**: Help → Show debug info
- **System Logs**: OS-specific locations

## 📝 Common Error Messages

### "Request failed with status 401"
**Cause:** Invalid or expired API key  
**Solution:** Verify API key at [Anthropic Console](https://console.anthropic.com)

### "Request failed with status 429"
**Cause:** Rate limiting (too many requests)  
**Solution:** Wait 1-2 minutes, then retry

### "Request failed with status 400"
**Cause:** Malformed request (usually prompt issues)  
**Solution:** Check custom action prompts for syntax errors

### "Network request failed"
**Cause:** Internet connectivity or firewall  
**Solution:** Check connection, try different network

### "Action not found"
**Cause:** Action disabled or plugin not fully loaded  
**Solution:** Check action settings, restart Obsidian

### "File not accessible"
**Cause:** Privacy restrictions or file permissions  
**Solution:** Check never-share patterns, file permissions

### "Context too large"
**Cause:** Document or context exceeds API limits  
**Solution:** Reduce context size, select smaller portions

## 🆘 Getting Help

### Self-Service Resources

**1. Wiki Pages**
- [Installation & Setup](Installation-and-Setup) - Setup issues
- [Action Guide](Action-Guide) - Action-specific problems  
- [Configuration](Configuration) - Settings and privacy
- [Custom Actions](Custom-Actions) - Custom action issues

**2. Built-in Help**
- Terminal: Type `/help` for available commands
- Settings: Hover over settings for explanations
- Console: Check for real-time error messages

### Community Support

**GitHub Resources:**
- 🐛 **[Report Bugs](https://github.com/AKSDug/Triple-Crown/issues)** - Detailed issue reporting
- 💬 **[Discussions](https://github.com/AKSDug/Triple-Crown/discussions)** - Ask questions, share tips
- 📚 **[Wiki](https://github.com/AKSDug/Triple-Crown/wiki)** - Comprehensive documentation

**Before Posting Issues:**

**Include This Information:**
1. **Obsidian version** (Settings → About)
2. **Triple-Crown version** (Plugin settings)
3. **Operating system** (Windows, macOS, Linux)
4. **Steps to reproduce** the problem
5. **Expected vs actual behavior**
6. **Console error messages** (F12 → Console)
7. **Configuration details** (remove sensitive info)

**Example Issue Report:**
```markdown
## Bug Report

**Environment:**
- Obsidian: 1.4.16
- Triple-Crown: 1.1.0  
- OS: macOS 13.5

**Problem:**
Writing Assistant action fails with "Request timeout" error

**Steps to Reproduce:**
1. Select paragraph of text (50+ words)
2. Run "Writing Assistant" from Command Palette
3. Choose "Improve" option
4. Wait 30+ seconds, get timeout error

**Expected:** Improved text suggestion
**Actual:** Timeout error message

**Console Errors:**
```
Error: Request timeout after 30000ms
    at ClaudeService.sendRequest (main.js:234)
```

**Configuration:**
- Model: claude-3-5-sonnet-20241022
- Context size: 10000
- Internet: Stable, 100Mbps
```

### Professional Support

**For Enterprise/Business Use:**
- Priority support available for business licenses
- Custom configuration assistance
- Security audit and compliance help
- Training and onboarding services

**Contact via:**
- GitHub profile for business inquiries
- Enterprise support requests through GitHub

## 🔄 Reset & Recovery

### Complete Plugin Reset

**If all else fails, completely reset Triple-Crown:**

1. **Backup Important Data**
   ```bash
   # Backup custom actions and settings
   cp ~/.obsidian/plugins/triple-crown/data.json ~/triple-crown-backup.json
   ```

2. **Remove Plugin Completely**
   - Disable plugin in Obsidian
   - Close Obsidian
   - Delete `vault/.obsidian/plugins/triple-crown/` folder

3. **Clean Reinstall**
   - Download fresh plugin files
   - Install following [Installation Guide](Installation-and-Setup)
   - Reconfigure from scratch

4. **Restore Custom Actions**
   - Import backed up settings if needed
   - Recreate custom actions manually

### Vault Migration Issues

**Moving to New Vault:**
1. Export settings from old vault
2. Copy `.claude/` folders manually  
3. Install plugin in new vault
4. Import settings and test functionality

---

**Still having issues?**

➡️ **[Report Bug](https://github.com/AKSDug/Triple-Crown/issues)** - Get specific help  
➡️ **[Ask Community](https://github.com/AKSDug/Triple-Crown/discussions)** - Community support  
➡️ **[Check Updates](https://github.com/AKSDug/Triple-Crown/releases)** - Latest fixes
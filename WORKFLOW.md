# Git Workflow Guide

This guide helps you sync changes between **Cursor** and **Gemini 3** without losing work.

## ⚠️ Important: Tool Differences

- **Cursor**: Can run terminal commands directly (scripts work automatically)
- **Gemini 3**: Cannot run terminal commands - you need to run them manually in your terminal/IDE

## 🚀 Quick Start

### Before Starting Work (Always do this first!)

**In Cursor:**
```bash
npm run sync
# OR
./scripts/sync-from-github.sh
```

**In Gemini 3:**
1. Open your terminal/IDE terminal
2. Navigate to project: `cd /path/to/GodlyKidsGeminiProject`
3. Run: `git pull origin main`
4. Then provide the updated files to Gemini 3 in your prompt

### After Making Changes

**In Cursor:**
```bash
npm run push
# OR
./scripts/push-to-github.sh
```

**In Gemini 3:**
1. After Gemini 3 makes code changes, copy the modified files
2. Save them to your local project
3. In your terminal, run:
   ```bash
   git add .
   git commit -m "Description of changes"
   git pull origin main
   git push origin main
   ```

## 📋 Recommended Workflows

### Workflow 1: Simple Sync (For Small Changes)

**When to use:** Making quick changes in either Cursor or Gemini 3

#### In Cursor:
1. **Before starting:**
   ```bash
   npm run sync
   ```

2. **Make your changes** in Cursor

3. **After finishing:**
   ```bash
   npm run push
   ```

#### In Gemini 3:
1. **Before starting:**
   - Open terminal: `git pull origin main`
   - Copy the current file contents into your Gemini 3 prompt

2. **Make your changes** - Gemini 3 will provide modified code

3. **After finishing:**
   - Save the modified files to your project
   - In terminal:
     ```bash
     git add .
     git commit -m "Changes from Gemini 3"
     git pull origin main
     git push origin main
     ```

### Workflow 2: Working in Both Tools

**Step-by-step for syncing between Cursor and Gemini 3:**

#### Scenario: You made changes in Cursor, now want to work in Gemini 3

1. **In Cursor terminal:**
   ```bash
   git add .
   git commit -m "Changes from Cursor"
   git push origin main
   ```

2. **In Gemini 3:**
   - Open your terminal: `git pull origin main`
   - Copy the updated file contents into Gemini 3 prompt
   - Make your changes
   - Save files, then in terminal:
     ```bash
     git add .
     git commit -m "Changes from Gemini 3"
     git pull origin main
     git push origin main
     ```

3. **Back in Cursor:**
   ```bash
   npm run sync  # Gets Gemini 3's changes
   ```

#### Scenario: You made changes in Gemini 3, now want to work in Cursor

1. **After Gemini 3 changes:**
   - Save files
   - In terminal:
     ```bash
     git add .
     git commit -m "Changes from Gemini 3"
     git push origin main
     ```

2. **In Cursor:**
   ```bash
   npm run sync  # Gets Gemini 3's changes
   ```

### Workflow 3: Branch-Based (For Larger Features)

**When to use:** Working on a feature or making significant changes

1. **Create a branch** (in terminal):
   ```bash
   git checkout -b feature-name
   # OR use script: ./scripts/create-work-branch.sh
   ```

2. **Make changes** in your preferred tool (Cursor or Gemini 3)

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description"
   git push origin feature-name
   ```

4. **When ready, merge to main:**
   ```bash
   git checkout main
   git pull origin main
   git merge feature-name
   git push origin main
   ```

## 🛠️ Common Scenarios

### Scenario 1: You Have Uncommitted Changes in Cursor

**In Cursor terminal:**
```bash
# Stash your changes
git stash

# Pull latest from GitHub
git pull origin main

# Restore your changes
git stash pop
```

### Scenario 2: You Have Uncommitted Changes and Want to Use Gemini 3

1. **In terminal:**
   ```bash
   git stash  # Save your Cursor changes
   git pull origin main  # Get latest
   ```

2. **In Gemini 3:**
   - Provide the updated files
   - Make changes
   - Save files

3. **In terminal:**
   ```bash
   git add .
   git commit -m "Changes from Gemini 3"
   git push origin main
   git stash pop  # Restore your Cursor changes
   ```

### Scenario 3: Merge Conflicts

If you get conflicts:

1. Git will mark conflicted files
2. Open the files and look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Their changes
   >>>>>>> branch-name
   ```
3. Edit to keep the code you want
4. Resolve:
   ```bash
   git add .
   git commit -m "Resolved conflicts"
   ```

### Scenario 4: Working with Gemini 3 - Step by Step

**Best practice for Gemini 3 workflow:**

1. **Before asking Gemini 3 to modify code:**
   ```bash
   git pull origin main
   ```
   Then copy the current file content into your Gemini 3 prompt

2. **After Gemini 3 provides modified code:**
   - Save the modified file(s) to your project
   - In terminal:
     ```bash
     git status  # See what changed
     git add .
     git commit -m "Description of Gemini 3 changes"
     git pull origin main  # Check for conflicts
     git push origin main
     ```

3. **If you want to continue in Cursor:**
   ```bash
   npm run sync  # Gets all changes including Gemini 3's
   ```

## 📝 Best Practices

1. **Always pull before starting work**
   - Prevents conflicts
   - Ensures you have latest code
   - **For Gemini 3**: Pull, then copy files into prompt

2. **Commit often**
   - Small, logical commits
   - Clear commit messages
   - **For Gemini 3**: Commit after each set of changes

3. **Push regularly**
   - Don't let changes accumulate
   - Makes syncing easier
   - **For Gemini 3**: Push after saving files

4. **Use branches for features**
   - Keeps main branch stable
   - Easier to review changes

5. **Communicate with yourself**
   - Use clear commit messages
   - Note which tool made the changes
   - Example: "Add feature X - from Gemini 3"

## 🔧 Scripts Reference

### For Cursor (can run directly):

**`sync-from-github.sh`** or `npm run sync`
- Pulls latest changes from GitHub
- Handles uncommitted changes safely
- Shows recent commits

**`push-to-github.sh`** or `npm run push`
- Stages, commits, and pushes changes
- Pulls first to avoid conflicts
- Interactive commit message

**`create-work-branch.sh`** or `npm run branch`
- Creates a new branch for features
- Switches to the new branch
- Prevents duplicate branches

### For Gemini 3 (run manually in terminal):

Since Gemini 3 can't run scripts, use these commands directly:

```bash
# Sync (get latest)
git pull origin main

# Push (after making changes)
git add .
git commit -m "Your message"
git pull origin main
git push origin main

# Create branch
git checkout -b branch-name

# Check status
git status
```

## 🆘 Troubleshooting

### "Your branch is ahead of origin/main"
```bash
git push origin main
```

### "Your branch is behind origin/main"
```bash
git pull origin main
```

### "Merge conflict"
1. Open conflicted files
2. Resolve conflicts manually (remove conflict markers)
3. `git add .`
4. `git commit -m "Resolved conflicts"`

### "Permission denied"
- Check GitHub authentication
- Verify SSH keys or token

### "Gemini 3 made changes but I'm not sure what to do"
1. Save the modified files Gemini 3 provided
2. In terminal:
   ```bash
   git status  # See what changed
   git diff    # See actual changes
   git add .
   git commit -m "Changes from Gemini 3"
   git pull origin main
   git push origin main
   ```

## 📚 Quick Command Reference

### Essential Commands (for Gemini 3 users)

```bash
# Get latest changes
git pull origin main

# See what changed
git status
git diff

# Save and push changes
git add .
git commit -m "Description"
git pull origin main
git push origin main

# If you have uncommitted work
git stash
git pull origin main
git stash pop
```

### Git Aliases (if configured)

```bash
git sync        # Pull latest changes
git save "msg"  # Add, commit with message
git quickpush   # Pull then push (after committing)
```

---

## 🎯 Summary: Gemini 3 Workflow

**Key Point:** Gemini 3 cannot run terminal commands. You must run them manually.

1. **Before Gemini 3:**
   - Terminal: `git pull origin main`
   - Copy file contents into Gemini 3 prompt

2. **Gemini 3 makes changes:**
   - Provides modified code

3. **After Gemini 3:**
   - Save modified files
   - Terminal:
     ```bash
     git add .
     git commit -m "Description"
     git pull origin main
     git push origin main
     ```

**Remember:** When in doubt, pull before you push! 🔄

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import Markdown from 'marked-react';
import throttle from 'lodash/throttle';
const PersonalAccessToken = process.env.REACT_APP_PERSONAL_ACCESS_TOKEN;
const CLIENT_ID = 'Iv1.5f95480a214aafea';
const PER_PAGE = 10;

function App() {

  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({});
  const [repositories, setRepositories] = useState([]);
  //issue
  const [issue, setIssue] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [repoName, setRepoName] = useState('');
  const [owner, setOwner] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editingIssueId, setEditingIssueId] = useState();
  const [author_association, setAuthorAssociation] = useState();
  //add issue
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');


  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
  
    if (codeParam && localStorage.getItem("accessToken") === null) {
      async function getAccessToken() {
        await fetch('http://localhost:4000/getAccessToken?code=' + codeParam, {
          method: 'GET'
        }).then((response) => {
          // console.log(response);
          return response.json();
        }).then((data) => {      
          // console.log(data);
          if (data.access_token) {          
            localStorage.setItem('accessToken', data.access_token);
            setRerender(!rerender);
          }
        });
      }
      getAccessToken();
    } else {
      getUserData();
    }
  }, []); //rerender
  
  
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      getUserData();
    }
  }, [localStorage.getItem('accessToken')]);

  // const getUserData = async () => {
  //   try {
  //     const accessToken = localStorage.getItem('accessToken');
  //     const response = await fetch(`http://localhost:4000/getUserData`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${accessToken}`
  //       }
  //     });
  //     const data = await response.json();
  //     const octokit = new Octokit({ auth: accessToken });
  //     const repositoriesResponse = await octokit.request('GET /user/repos');
  //     setRepositories(repositoriesResponse.data);
  //     setUserData(data);
  //   } catch (error) {
  //     handleError(error);
  //   }
  // };
  const getUserData = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:4000/getUserData`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      const octokit = new Octokit({ auth: accessToken });
      const repositoriesResponse = await octokit.request('GET /users/:username/repos', {
        username: 'babupersonal',
      });
      
      setRepositories(repositoriesResponse.data);
      setUserData(data);
    } catch (error) {
      handleError(error);
    }
  };

  const getIssues = async (repoName, owner) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const octokit = new Octokit({ auth: accessToken });
        const issueResponse = await octokit.request(`GET /repos/${owner}/${repoName}/issues`, {
            per_page: PER_PAGE,
        });
  
        for (const issueItem of issueResponse.data) {
            const commentsResponse = await octokit.request(`GET /repos/${owner}/${repoName}/issues/${issueItem.number}/comments`);
            const comments = commentsResponse.data.filter(comment => comment.body); // 排除空评论
            issueItem.comments = comments;
            issueItem.body = issueItem.body; // 将评论内容赋值给 body
        }
  
        const filteredIssues = issueResponse.data.map(issueItem => ({
            ...issueItem,
            comments: issueItem.comments.filter(comment => comment.body.trim() !== '')
        }));
  
        setIssue(prevIssue => [...prevIssue, ...filteredIssues]);
        setLoading(false);
    } catch (error) {
        handleError(error);
    }
  };
  

  //滾輪偵測文章載入
  const handleScroll = throttle(async (e) => {
    const container = e.target;
    const bottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    if (bottom && !loading && owner && repoName) {
      setLoading(true);
  
      const accessToken = localStorage.getItem('accessToken');
      const octokit = new Octokit({ auth: accessToken });
  
      try {
        const repoInfoResponse = await octokit.request(`GET /repos/${owner}/${repoName}`);
        const totalIssues = repoInfoResponse.data.open_issues_count;
        const currentIssuesCount = issue.length;

        if (currentIssuesCount >= totalIssues) {
          setLoading(false);
          return;
        }
  
        const nextPage = Math.ceil(currentIssuesCount / PER_PAGE) + 1;
  
        const issueResponse = await octokit.request(`GET /repos/${owner}/${repoName}/issues`, {
          per_page: PER_PAGE,
          page: nextPage
      });
        const newIssues = issueResponse.data.map(issueItem => ({
          ...issueItem,
          comments: []
      }));
        // console.log(totalIssues);
        // console.log(currentIssuesCount);
        // console.log(nextPage);

        setIssue(prevIssue => [...prevIssue, ...newIssues]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching additional issues:', error);
        setLoading(false);
      }
    }
  }, 500);
     
  const parseMarkdown = (markdownContent) => {
    return markdownContent; 
  };
  
  function logingithub() {
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo%20read:user%20write:discussion%20repo:status%20write:repo`
    );
  }
  const handleError = (error) => {
    console.error('Error:', error);
  };
  // 删除文章
  // const DeleteIssue = async (issueId) => {
  //   if (window.confirm('Are you sure you want to delete this issue?')) {
  //     try {
  //       const editedIssue = issue.find(item => item.id === issueId);
  //       if (!editedIssue) {
  //         console.error('Edited issue not found in the issue array.');
  //         return;
  //       }
  //       const accessToken = localStorage.getItem('accessToken');
  //       const octokit = new Octokit({ auth: accessToken });
  
  //       // 使用 GitHub REST API 删除 Issue
  //       await octokit.request(`DELETE /repos/${owner}/${repoName}/issues/${editedIssue.number}`, {
  //         headers: {
  //           Authorization: `token ${accessToken}`
  //         }
  //       });
  
  //       // 从 issue 状态中移除被删除的 Issue
  //       setIssue(prevIssue => prevIssue.filter(issueItem => issueItem.id !== issueId));
  //     } catch (error) {
  //       handleError(error);
  //     }
  //   }
  // }
  //編輯文章
  const EditingCompleted = async (id, title, content) => {
    const editedIssue = issue.find(item => item.id === id);
    if (!editedIssue) return;
    if (!title.trim()) {
      window.confirm('請輸入標題');
      return;
    }
    if (content.trim().length < 30) {
      window.confirm('至少輸入30個字元');
        return;
    }
    if (editedIssue.title === title && editedIssue.body === content) {
      setEditingIssueId(null);
      return;
    } 
  
    try {
      const accessToken = PersonalAccessToken;
      if (!accessToken) {
        console.error('Access token not found.');
        return;
      }
      const octokit = new Octokit({ auth: accessToken });
      if (!owner || !repoName) {
        console.error('Owner or repoName not found.');
        return;
      }
      if (editedIssue.author_association === "OWNER") {
      const response = await octokit.request(`PATCH /repos/${owner}/${repoName}/issues/${editedIssue.number}`, {
        title: title,
        body: content
      });
        
      // 输出编辑成功的信息
      console.log('Editing completed successfully:', response.data);
        
      // 更新 issue 状态中对应 Issue 的内容
      setIssue(prevIssue => {
        return prevIssue.map(issueItem => {
          if (issueItem.id === editedIssue.id) {
            return { ...issueItem, title: title, body: content };
          }
          return issueItem;
        });
      });
      setEditingIssueId(null);
    }
  } catch (error) {
    handleError(error);
  }
};
  
  //  取消編輯
  const CancelEdit = async () => {
    setEditingIssueId(null);
  }
  //新增文章
  const handleSubmit = async () => {
    try {
      const accessToken = PersonalAccessToken;
      console.log(accessToken);
      if (!accessToken) {
        console.error('Access token not found.');
        return;
      }
      const selectedRepo = repositories.find(repo => repo.name === repoName);
      if (!selectedRepo) {
        console.error(`Repository with name ${repoName} not found.`);
        return;
      }
      if (!title.trim()) {
        window.confirm('請輸入標題');
        return;
      }
      if (content.trim().length < 30) {
        window.confirm('至少輸入30個字元');
          return;
      }
      const newIssue = {
        title: title,
        body: content,
        comments: [] 
      };
      const url = `https://api.github.com/repos/${owner}/${repoName}/issues`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newIssue),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        console.log('Issue created successfully:', responseData);
        setIssue(prevIssue => [responseData, ...prevIssue]);
        setTitle('');
        setContent('');
      } else {
        console.error(responseData);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const [isOpen, setIsOpen] = useState(false); // 初始化 isOpen 和 setIsOpen

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="App">
      <header className="App-header">
        {localStorage.getItem('accessToken') ?
          <>
            <FontAwesomeIcon
              className={`setting ${isOpen ? 'rotate' : ''}`}
              onClick={toggleMenu}
              icon={faGear}
            />
            <div className={`menu ${isOpen ? 'open' : ''}`}>
              <nav className='c cc'>
                <button onClick={() => { localStorage.removeItem('accessToken'); setRerender(!rerender); }}>Log out</button>
              </nav>
            </div>
            <div>
              <h2 className='py-4'>Welcome babupersonal Repositories:</h2>
              <div className='repo'>
              {repositories.length > 0 && repositories.map((repo, index) => (
                <button
                  className='repo-list'
                  key={index}
                  onClick={() => {
                    setIssue([]); 
                    const selectedRepo = repositories[index]; // 获取所选仓库
                    setRepoName(selectedRepo.name); // 更新所选仓库的名称状态
                    setOwner(selectedRepo.owner.login); // 更新所选仓库的所有者状态
                    getIssues(selectedRepo.name, selectedRepo.owner.login); 
                    setShowForm(true);
                  }}
                >
                  {repo.name}
                </button>
              ))}
              </div>
            </div>
            <div className='c py-3'>
              <h3>{repoName ? `${repoName} Issue:` : 'Issue'}</h3>
            </div>
            <div className='issue-list' onScroll={handleScroll}>
            {issue.length > 0 ? (
              issue.map((issueItem, index) => (
                <div className='issues' key={index}>
                  {editingIssueId === issueItem.id ? (
                    <div className='issue-column'>
                      <div className='c col-12' >
                      <h3 className='col-lg-3'>Issue Title</h3>
                      <textarea 
                        className='issue-area col-lg-9'
                        value={editingIssueId === issueItem.id ? editedTitle : issueItem.title}
                        onChange={(e) => {
                          if (editingIssueId === issueItem.id) {
                            setEditedTitle(e.target.value);
                          } else {
                            setIssue(prevIssue => {
                              return prevIssue.map(item => {
                                if (item.id === issueItem.id) {
                                  return { ...item, title: e.target.value };
                                }
                                return item;
                              });
                            });
                          }
                        }}
                      />
                      </div>
                      < div className='c col-12'>
                        <h3 className='col-lg-3'>Issue Content</h3>
                        <textarea 
                          className='issue-area col-lg-9'
                          value={editingIssueId === issueItem.id ? editedContent : issueItem.body}
                          onChange={(e) => {
                            if (editingIssueId === issueItem.id) {
                              setEditedContent(e.target.value);
                            } else {
                              setIssue(prevIssue => {
                                return prevIssue.map(item => {
                                  if (item.id === issueItem.id) {
                                    return { ...item, body: e.target.value };
                                  }
                                  return item;
                                });
                              });
                            }
                          }}
                        />
                      </div>
                        <div className='c'>
                          <button className='btn issue-btn' onClick={() => EditingCompleted(issueItem.id, editedTitle, editedContent)}>完成編輯</button>
                          <button className='btn issue-btn' onClick={() => CancelEdit(issueItem.id)}>取消編輯</button>
                        </div>
                    </div>
                  ) : (
                    <div className='c issue-out'>
                      <div className='c cc w-100'>
                        <div className='issue-title'><Markdown>{parseMarkdown(`${index + 1}: ${issueItem.title}`)}</Markdown></div>
                        <div className='c w-100'>
                          <div className='issue-content'><Markdown>{parseMarkdown(`${issueItem.body}`)}</Markdown></div>
                          <div className='issue-msg-out'>
                            <div className='issue-msg'>
                            {issueItem.comments && issueItem.comments.map((comment, commentIndex) => (
                                comment.body.trim() !== '' && <div className='msg-list' key={commentIndex}><Markdown>{parseMarkdown(comment.body)}</Markdown></div>
                            ))}
                            </div>
                          </div>
                        </div>
                        {issueItem.author_association === "OWNER" && userData.login === "babupersonal" && (
                          <>
                          <button className='btn issue-btn' onClick={() => {
                            setEditedTitle(issueItem.title);
                            setEditedContent(issueItem.body);
                            setEditingIssueId(issueItem.id);
                          }}>編輯</button>
                          {/* <button className='btn issue-btn' onClick={() => DeleteIssue(issueItem.id)}>刪除</button> */}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No issues</p>
            )}
            {loading && <p>Loading...</p>}
          </div>
          {/* {issue.length > 0 && ( */}
            <div className='add-issue'>
              {issue.some(issueItem => issueItem.author_association === "OWNER" && userData.login === "babupersonal" && showForm) && (
                <div className='c cc'>
                  <h3 className='py-3'>Add a new {repoName} Issue</h3>
                  <textarea 
                    placeholder='輸入標題' 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                  ></textarea>
                  <textarea 
                    placeholder='輸入內容' 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  ></textarea>
                  <div>
                    <button className='btn issue-btn' type="button" onClick={handleSubmit}>新增</button>
                    {/* <button type="button" onClick={closeModal}>關閉</button> */}
                  </div>
                </div>
              )}
            </div>
          {/* )} */}
       
          </>
          :
          <>
            <div className='login-img'>
              <div className='effect c'>
                <button className='btn' onClick={logingithub}>Login With Github</button>
              </div>
            </div>
          </>
        }

      </header>
    </div>
  );

}

export default App;

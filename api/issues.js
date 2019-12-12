const express = require('express');
const issuesRouter = express.Router({mergeParams:true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE ||'./database.sqlite');


issuesRouter.param('issueId',(req,res,next,id)=>{
  db.get('SELECT * FROM Issue WHERE id = $id',{$id:id},(err,issue)=>{
    if(err){
      next(err);
    } else if (!issue){
      res.sendStatus(404);
      return;
    } else {
      req.issue = issue;
      next();
    }
  })
})


issuesRouter.get('/',(req,res,next)=>{
  db.all(`SELECT * FROM Issue WHERE series_id = ${req.series.id}`,(error,issues)=>{
    if(error){ 
      next(error)
    }else{
      res.status(200).json({issues:issues})
    }
  })
})

issuesRouter.post('/',(req,res,next)=>{
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate
  const artistId = req.body.issue.artistId;
  if (!name || !issueNumber || !publicationDate || !artistId){
    res.sendStatus(400);
    return;
  } 
  db.get('SELECT * FROM Artist WHERE id = $id',{$id:artistId},(err,artist)=>{
    if(err){
      next(err);
    } else if(!artist){
      res.sendStatus(400);
    } else{
      db.run(`INSERT INTO Issue (name,issue_number,publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId);`,{
        $name: name,
        $issueNumber : issueNumber,
        $publicationDate : publicationDate,
        $artistId : artistId,
        $seriesId : req.series.id
      },function(error){
        if(error){
          next(error);
        } else {
          db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`,(err,issue)=>{
            if(err){
              next(err);
            } else{
              res.status(201).json({issue:issue});
            }
          })
        }
      })
    }
  })
})

issuesRouter.put('/:issueId',(req,res,next)=>{
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate
  const artistId = req.body.issue.artistId;
  if (!name || !issueNumber || !publicationDate || !artistId){
    res.sendStatus(400);
    return;
  } 
  db.get('SELECT * FROM Artist WHERE id = $id',{$id:artistId},(err,artist)=>{
    if(err){
      next(err);
    } else if(!artist){
      res.sendStatus(400);
    } else {
      db.run(`UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE id = $id`,{
        $name:name,
        $issueNumber:issueNumber,
        $publicationDate:publicationDate,
        $artistId : artistId,
        $id : req.params.issueId
      },(err)=>{
        if(err){
          next(err);
        }else{
          db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`,(err,issue)=>{
            if(err){
              next(err);
            } else{
              res.status(200).json({issue:issue});
            }
          })
        }
      })
    }
  })
})

issuesRouter.delete('/:issueId',(req,res,next)=>{
  db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`,(err)=>{
    if(err){
      next(err);
    } else{
      res.sendStatus(204);
    }
  })
})

module.exports = issuesRouter


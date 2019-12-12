const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE ||'./database.sqlite')
const issuesRouter = require('./issues');


seriesRouter.param('seriesId',(req,res,next,id)=>{
  db.get('SELECT * FROM Series WHERE id = $id',{$id:id},(err,series)=>{
    if(err){
      next(err);
    } else if (!series){
      res.sendStatus(404);
      return;
    } else {
      req.series = series;
      next();
    }
  })
})

seriesRouter.use('/:seriesId/issues',issuesRouter);

seriesRouter.get('/',(req,res,next)=>{
  db.all('SELECT * FROM Series',(err,series)=>{
    if(err){
      next(err);
    } else {
      res.status(200).json({series:series})
    }
  })
})

seriesRouter.get('/:seriesId',(req,res,next)=>{
  res.status(200).json({series:req.series});
})

seriesRouter.post('/',(req,res,next)=>{
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description){
    res.sendStatus(400);
    return;
  } else{
    db.run(`INSERT INTO Series (name, description) VALUES ($name,$description)`,{
      $name:name,
      $description : description
    },function(error){
      if(error){
        next(error);
      }else{
        db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`,(err,series)=>{
          if(err){
            next(err);
          } else{
            res.status(201).json({series:series});
          }
        })
      }
    })
  }
})

seriesRouter.put('/:seriesId',(req,res,next)=>{
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description){
    res.sendStatus(400);
    return;
  } else{
    db.run(`UPDATE Series SET name = $name, description = $description WHERE id = $id`,{
      $name : name,
      $description : description,
      $id : req.series.id
    },function(error){
      if(error){
        next(error)
      } else{
        db.get(`SELECT * FROM Series WHERE id = ${req.series.id}`,(err,series)=>{
          if(err){
            next(err);
          }else{
            res.status(200).json({series:series})
          }
        })
      }
    })
  }
})

seriesRouter.delete('/:seriesId',(req,res,next)=>{
  db.get(`SELECT * FROM Issue WHERE Issue.series_id = ${req.series.id}`,(err,issues)=>{
    if(err){
      next(err);
    } else if (issues){
      console.log(issues);
      res.sendStatus(400);
      return;
    } else {
      console.log(`Deleting!`)
      db.run(`DELETE FROM Series WHERE id = ${req.series.id};`,(err)=>{
        if(err){
          next(err);
        } else{
          res.sendStatus(204)
        }
      })
    }
  })
})

module.exports = seriesRouter;